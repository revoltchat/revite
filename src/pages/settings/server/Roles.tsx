import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { Server } from "revolt.js/dist/maps/Servers";

import { useLayoutEffect, useMemo, useState } from "preact/hooks";

import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import ColourSwatches from "../../../components/ui/ColourSwatches";
import InputBox from "../../../components/ui/InputBox";
import Overline from "../../../components/ui/Overline";

import { PermissionList } from "../../../components/settings/roles/PermissionList";
import {
    RoleOrDefault,
    RoleSelection,
} from "../../../components/settings/roles/RoleSelection";
import { UnsavedChanges } from "../../../components/settings/roles/UnsavedChanges";

interface Props {
    server: Server;
}

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

export const Roles = observer(({ server }: Props) => {
    // Consolidate all permissions that we can change right now.
    const currentRoles = useRoles(server);

    // Keep track of whatever role we're editing right now.
    const [selected, setSelected] = useState("default");
    const [value, setValue] = useState<Partial<RoleOrDefault>>({});
    const currentRole = currentRoles.find((x) => x.id === selected)!;
    const currentRoleValue = { ...currentRole, ...value };

    // If a role gets deleted, unselect it immediately.
    useLayoutEffect(() => {
        if (!server.roles) return;
        if (!server.roles[selected]) {
            setSelected("default");
        }
    }, [server.roles]);

    // Calculate permissions we have access to on this server.
    const current = server.permission;

    // Upload new role information to server.
    function save() {
        const { permissions: permsCurrent, ...current } = currentRole;
        const { permissions: permsValue, ...value } = currentRoleValue;

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
        setSelected("default");
        server.deleteRole(selected);
    }

    return (
        <div style={{ height: "100%", overflowY: "scroll" }}>
            <h1>Select Role</h1>
            <RoleSelection
                selected={selected}
                onSelect={(id) => {
                    setValue({});
                    setSelected(id);
                }}
                roles={currentRoles}
            />
            {selected !== "default" && (
                <>
                    <hr />
                    <h1>Edit Role</h1>
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
                        <Overline type="subtle">Role Colour</Overline>
                        <p>
                            <ColourSwatches
                                value={currentRoleValue.colour ?? "gray"}
                                onChange={(colour) =>
                                    setValue({ ...value, colour })
                                }
                            />
                        </p>
                    </section>
                    <section>
                        <Overline type="subtle">Role Options</Overline>
                        <p>
                            <Checkbox
                                checked={currentRoleValue.hoist ?? false}
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
                            Experimental Role Ranking
                        </Overline>
                        <p>
                            <InputBox
                                value={currentRoleValue.rank ?? 0}
                                onChange={(e) =>
                                    setValue({
                                        ...value,
                                        rank: parseInt(e.currentTarget.value),
                                    })
                                }
                                contrast
                            />
                        </p>
                    </section>
                </>
            )}
            {!isEqual(currentRole, currentRoleValue) && (
                <>
                    <hr />
                    <UnsavedChanges save={save} />
                </>
            )}
            <hr />
            <h1>Edit Permissions</h1>
            <PermissionList
                value={currentRoleValue.permissions}
                onChange={(permissions) =>
                    setValue({ ...value, permissions } as RoleOrDefault)
                }
            />
            {selected !== "default" && (
                <>
                    <hr />
                    <h1>Danger Zone</h1>
                    <Button contrast error onClick={deleteRole}>
                        Delete Role
                    </Button>
                </>
            )}
        </div>
    );
});
