import { HelpCircle } from "@styled-icons/boxicons-solid";
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
import { modalController } from "../../../controllers/modals/ModalController";

interface Props {
    server: Server;
}

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
 * Roles settings menu
 */
export const Roles = observer(({ server }: Props) => {
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

    return (
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

                // Keep track of whatever role we're editing right now.
                const [value, setValue] = useState<Partial<RoleOrDefault>>({});

                const currentRoleValue = { ...currentRole, ...value };

                // Calculate permissions we have access to on this server.
                const current = server.permission;

                // Upload new role information to server.
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

                // Delete the role from this server.
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
                                                    name: e.currentTarget.value,
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
                                                setValue({ ...value, colour })
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
                                                currentRoleValue.hoist ?? false
                                            }
                                            onChange={(hoist) =>
                                                setValue({ ...value, hoist })
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
                                <section>
                                    <Category>
                                        <Text id="app.settings.permissions.role_ranking" />
                                    </Category>
                                    <p>
                                        <InputBox
                                            type="number"
                                            value={currentRoleValue.rank ?? 0}
                                            onChange={(e) =>
                                                setValue({
                                                    ...value,
                                                    rank: parseInt(
                                                        e.currentTarget.value,
                                                    ),
                                                })
                                            }
                                            palette="secondary"
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
    );
});
