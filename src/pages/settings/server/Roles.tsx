import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { Server } from "revolt.js";

import { useMemo, useState } from "preact/hooks";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import Checkbox from "../../../components/ui/Checkbox";
import ColourSwatches from "../../../components/ui/ColourSwatches";
import InputBox from "../../../components/ui/InputBox";
import Overline from "../../../components/ui/Overline";
import { Button, PermissionsLayout, SpaceBetween, H1 } from "@revoltchat/ui";

import { PermissionList } from "../../../components/settings/roles/PermissionList";
import { RoleOrDefault } from "../../../components/settings/roles/RoleSelection";

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

    // Pull in modal context.
    const { openScreen } = useIntermediate();

    return (
        <PermissionsLayout
            server={server}
            onCreateRole={(callback) =>
                openScreen({
                    id: "special_input",
                    type: "create_role",
                    server: server as any,
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
                            <H1>Edit {currentRole.name}</H1>
                            <Button
                                palette="secondary"
                                disabled={isEqual(
                                    currentRole,
                                    currentRoleValue,
                                )}
                                onClick={save}>
                                Save
                            </Button>
                        </SpaceBetween>
                        <hr />
                        {selected !== "default" && (
                            <>
                                <section>
                                    <Overline type="subtle">Role Name</Overline>
                                    <p>
                                        <InputBox
                                            value={currentRoleValue.name}
                                            onChange={(e) =>
                                                setValue({
                                                    ...value,
                                                    name: e.currentTarget.value,
                                                })
                                            }
                                            contrast
                                        />
                                    </p>
                                </section>
                                <section>
                                    <Overline type="subtle">
                                        Role Colour
                                    </Overline>
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
                                    <Overline type="subtle">
                                        Role Options
                                    </Overline>
                                    <p>
                                        <Checkbox
                                            checked={
                                                currentRoleValue.hoist ?? false
                                            }
                                            onChange={(hoist) =>
                                                setValue({ ...value, hoist })
                                            }
                                            description="Display this role above others.">
                                            Hoist Role
                                        </Checkbox>
                                    </p>
                                </section>
                                <section>
                                    <Overline type="subtle">
                                        Role Ranking
                                    </Overline>
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
                                            contrast
                                        />
                                    </p>
                                </section>
                            </>
                        )}
                        <h1>Edit Permissions</h1>
                        <PermissionList
                            value={currentRoleValue.permissions}
                            onChange={(permissions) =>
                                setValue({
                                    ...value,
                                    permissions,
                                } as RoleOrDefault)
                            }
                        />
                        {selected !== "default" && (
                            <>
                                <hr />
                                <h1>Danger Zone</h1>
                                <Button
                                    palette="error"
                                    compact
                                    onClick={deleteRole}>
                                    Delete Role
                                </Button>
                            </>
                        )}
                    </div>
                );
            }}
        />
    );
});
