import {
    HelpCircle,
    ChevronUp,
    ChevronDown,
} from "@styled-icons/boxicons-solid";
import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { Server } from "revolt.js";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useMemo, useState } from "preact/hooks";

import {
    Button,
    PermissionsLayout,
    SpaceBetween,
    H1,
    Checkbox,
    ColourSwatches,
    InputBox,
    Category,
} from "@revoltchat/ui";

import Tooltip from "../../../components/common/Tooltip";
import { PermissionList } from "../../../components/settings/roles/PermissionList";
import { RoleOrDefault } from "../../../components/settings/roles/RoleSelection";
import { useSession } from "../../../controllers/client/ClientController";
import { modalController } from "../../../controllers/modals/ModalController";

interface Props {
    server: Server;
}

const RoleReorderContainer = styled.div`
    margin: 16px 0;
`;

const RoleItem = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin: 12px 0;
    background: var(--secondary-background);
    border-radius: var(--border-radius);
`;

const RoleInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const RoleName = styled.div`
    font-weight: 600;
    color: var(--foreground);
`;

const RoleRank = styled.div`
    font-size: 12px;
    color: var(--secondary-foreground);
`;

const RoleControls = styled.div`
    display: flex;
    gap: 4px;
`;

const MoveButton = styled(Button)`
    padding: 4px 8px;
    min-width: auto;
`;

/**
 * Hook to memo-ize role information with proper ordering
 * @param server Target server
 * @returns Role array with default at bottom
 */
export function useRolesForReorder(server: Server) {
    return useMemo(() => {
        const roles = [...server.orderedRoles] as RoleOrDefault[];

        roles.push({
            id: "default",
            name: "Default",
            permissions: server.default_permissions,
        });

        return roles;
    }, [server.roles, server.default_permissions]);
}

/**
 * Role reordering component
 */
const RoleReorderPanel = observer(({ server }: Props) => {
    const initialRoles = useRolesForReorder(server);
    const [roles, setRoles] = useState(initialRoles);
    const [isReordering, setIsReordering] = useState(false);

    // Update local state when server roles change
    useMemo(() => {
        setRoles(useRolesForReorder(server));
    }, [server.roles, server.default_permissions]);

    const moveRoleUp = (index: number) => {
        if (index === 0 || roles[index].id === "default") return;

        const newRoles = [...roles];
        [newRoles[index - 1], newRoles[index]] = [
            newRoles[index],
            newRoles[index - 1],
        ];
        setRoles(newRoles);
    };

    const moveRoleDown = (index: number) => {
        // Can't move down if it's the last non-default role or if it's default
        if (index >= roles.length - 2 || roles[index].id === "default") return;

        const newRoles = [...roles];
        [newRoles[index], newRoles[index + 1]] = [
            newRoles[index + 1],
            newRoles[index],
        ];
        setRoles(newRoles);
    };

    const saveReorder = async () => {
        setIsReordering(true);
        try {
            const nonDefaultRoles = roles.filter(
                (role) => role.id !== "default",
            );
            const roleIds = nonDefaultRoles.map((role) => role.id);

            const session = useSession()!;
            const client = session.client!;

            // Make direct API request since it's not in r.js as of writing
            await client.api.patch(`/servers/${server._id}/roles/ranks`, {
                ranks: roleIds,
            });

            console.log("Roles reordered successfully");
        } catch (error) {
            console.error("Failed to reorder roles:", error);
            setRoles(initialRoles);
        } finally {
            setIsReordering(false);
        }
    };

    const hasChanges = !isEqual(
        roles.filter((r) => r.id !== "default").map((r) => r.id),
        initialRoles.filter((r) => r.id !== "default").map((r) => r.id),
    );

    return (
        <div>
            <SpaceBetween>
                <H1>
                    <Text id="app.settings.permissions.role_ranking" />
                </H1>
                <Button
                    palette="secondary"
                    disabled={!hasChanges || isReordering}
                    onClick={saveReorder}>
                    <Text id="app.special.modals.actions.save" />
                </Button>
            </SpaceBetween>

            <RoleReorderContainer>
                {roles.map((role, index) => (
                    <RoleItem key={role.id}>
                        <RoleInfo>
                            <RoleName>{role.name}</RoleName>
                            <RoleRank>
                                {role.id === "default" ? (
                                    <Text id="app.settings.permissions.default_desc" />
                                ) : (
                                    <>
                                        <Text id="app.settings.permissions.role_ranking" />{" "}
                                        {index}
                                    </>
                                )}
                            </RoleRank>
                        </RoleInfo>

                        {role.id !== "default" && (
                            <RoleControls>
                                <MoveButton
                                    palette="secondary"
                                    disabled={index === 0}
                                    onClick={() => moveRoleUp(index)}>
                                    <ChevronUp size={16} />
                                </MoveButton>
                                <MoveButton
                                    palette="secondary"
                                    disabled={index >= roles.length - 2}
                                    onClick={() => moveRoleDown(index)}>
                                    <ChevronDown size={16} />
                                </MoveButton>
                            </RoleControls>
                        )}
                    </RoleItem>
                ))}
            </RoleReorderContainer>
        </div>
    );
});

/**
 * Hook to memo-ize role information.
 * @param server Target server
 * @returns Role array
 */
export function useRoles(server: Server) {
    return useMemo(
        () =>
            [
                // Pull in known server roles.
                ...server.orderedRoles,
                // Include the default server permissions.
                {
                    id: "default",
                    name: "Default",
                    permissions: server.default_permissions,
                },
            ] as RoleOrDefault[],
        [server.roles, server.default_permissions],
    );
}

/**
 * Updated Roles settings menu with reordering panel
 */
export const Roles = observer(({ server }: Props) => {
    const [showReorderPanel, setShowReorderPanel] = useState(false);

    // Consolidate all permissions that we can change right now.
    const currentRoles = useRoles(server);

    const RoleId = styled.div`
        gap: 4px;
        display: flex;
        align-items: center;

        font-size: 12px;
        font-weight: 600;
        color: var(--tertiary-foreground);

        a {
            color: var(--tertiary-foreground);
        }
    `;

    const DeleteRoleButton = styled(Button)`
        margin: 16px 0;
    `;

    const ReorderButton = styled(Button)`
        margin: 0 0 16px 0;
    `;

    if (showReorderPanel) {
        return (
            <div>
                <RoleReorderPanel server={server} />
                <Button
                    palette="secondary"
                    onClick={() => setShowReorderPanel(false)}
                    style={{ marginBottom: "16px" }}>
                    <Text id="app.special.modals.actions.back" />
                </Button>
            </div>
        );
    }

    return (
        <div>
            <ReorderButton
                palette="secondary"
                onClick={() => setShowReorderPanel(true)}>
                <Text id="app.settings.permissions.role_ranking" />
            </ReorderButton>
            <PermissionsLayout
                server={server}
                rank={server.member?.ranking ?? Infinity}
                onCreateRole={(callback) =>
                    modalController.push({
                        type: "create_role",
                        server,
                        callback,
                    })
                }
                editor={({ selected }) => {
                    const currentRole = currentRoles.find(
                        (x) => x.id === selected,
                    )!;

                    if (!currentRole) return null;

                    const [value, setValue] = useState<Partial<RoleOrDefault>>(
                        {},
                    );

                    const currentRoleValue = { ...currentRole, ...value };

                    function save() {
                        const { permissions: permsCurrent, ...current } =
                            currentRole;
                        const { permissions: permsValue, ...value } =
                            currentRoleValue;

                        if (!isEqual(permsCurrent, permsValue)) {
                            server.setPermissions(
                                selected,
                                typeof permsValue === "number"
                                    ? permsValue
                                    : {
                                          allow: permsValue.a,
                                          deny: permsValue.d,
                                      },
                            );
                        }

                        if (!isEqual(current, value)) {
                            server.editRole(selected, value);
                        }
                    }

                    function deleteRole() {
                        server.deleteRole(selected);
                    }

                    return (
                        <div>
                            <SpaceBetween>
                                <H1>
                                    <Text
                                        id="app.settings.actions.edit"
                                        fields={{ name: currentRole.name }}
                                    />
                                </H1>
                                <Button
                                    palette="secondary"
                                    disabled={isEqual(
                                        currentRole,
                                        currentRoleValue,
                                    )}
                                    onClick={save}>
                                    <Text id="app.special.modals.actions.save" />
                                </Button>
                            </SpaceBetween>
                            <hr />
                            {selected !== "default" && (
                                <>
                                    <section>
                                        <Category>
                                            <Text id="app.settings.permissions.role_name" />
                                        </Category>
                                        <p>
                                            <InputBox
                                                value={currentRoleValue.name}
                                                onChange={(e) =>
                                                    setValue({
                                                        ...value,
                                                        name: e.currentTarget
                                                            .value,
                                                    })
                                                }
                                                palette="secondary"
                                            />
                                        </p>
                                    </section>
                                    <section>
                                        <Category>{"Role ID"}</Category>
                                        <RoleId>
                                            <Tooltip
                                                content={
                                                    "This is a unique identifier for this role."
                                                }>
                                                <HelpCircle size={16} />
                                            </Tooltip>
                                            <Tooltip
                                                content={
                                                    <Text id="app.special.copy" />
                                                }>
                                                <a
                                                    onClick={() =>
                                                        modalController.writeText(
                                                            currentRole.id,
                                                        )
                                                    }>
                                                    {currentRole.id}
                                                </a>
                                            </Tooltip>
                                        </RoleId>
                                    </section>
                                    <section>
                                        <Category>
                                            <Text id="app.settings.permissions.role_colour" />
                                        </Category>
                                        <p>
                                            <ColourSwatches
                                                value={
                                                    currentRoleValue.colour ??
                                                    "gray"
                                                }
                                                onChange={(colour) =>
                                                    setValue({
                                                        ...value,
                                                        colour,
                                                    })
                                                }
                                            />
                                        </p>
                                    </section>
                                    <section>
                                        <Category>
                                            <Text id="app.settings.permissions.role_options" />
                                        </Category>
                                        <p>
                                            <Checkbox
                                                value={
                                                    currentRoleValue.hoist ??
                                                    false
                                                }
                                                onChange={(hoist) =>
                                                    setValue({
                                                        ...value,
                                                        hoist,
                                                    })
                                                }
                                                title={
                                                    <Text id="app.settings.permissions.hoist_role" />
                                                }
                                                description={
                                                    <Text id="app.settings.permissions.hoist_desc" />
                                                }
                                            />
                                        </p>
                                    </section>
                                </>
                            )}
                            <h1>
                                <Text id="app.settings.permissions.edit_title" />
                            </h1>
                            <PermissionList
                                value={currentRoleValue.permissions}
                                onChange={(permissions) =>
                                    setValue({
                                        ...value,
                                        permissions,
                                    } as RoleOrDefault)
                                }
                                target={server}
                            />
                            {selected !== "default" && (
                                <>
                                    <hr />
                                    <h1>
                                        <Text id="app.settings.categories.danger_zone" />
                                    </h1>
                                    <DeleteRoleButton
                                        palette="error"
                                        compact
                                        onClick={deleteRole}>
                                        <Text id="app.settings.permissions.delete_role" />
                                    </DeleteRoleButton>
                                </>
                            )}
                        </div>
                    );
                }}
            />
        </div>
    );
});
