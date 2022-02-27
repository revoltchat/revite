import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { OverrideField } from "revolt-api/types/_common";
import { Channel } from "revolt.js/dist/maps/Channels";

import { useLayoutEffect, useState } from "preact/hooks";

import { PermissionList } from "../../../components/settings/roles/PermissionList";
import {
    RoleOrDefault,
    RoleSelection,
} from "../../../components/settings/roles/RoleSelection";
import { UnsavedChanges } from "../../../components/settings/roles/UnsavedChanges";
import { useRoles } from "../server/Roles";

interface Props {
    channel: Channel;
}

export default observer(({ channel }: Props) => {
    // Consolidate all permissions that we can change right now.
    const currentRoles =
        channel.channel_type === "Group"
            ? ([
                  {
                      id: "default",
                      name: "Default",
                      permissions: channel.permissions,
                  },
              ] as RoleOrDefault[])
            : (useRoles(channel.server!).map((role) => {
                  return {
                      ...role,
                      permissions: (role.id === "default"
                          ? channel.default_permissions
                          : channel.role_permissions?.[role.id]) ?? {
                          a: 0,
                          d: 0,
                      },
                  };
              }) as RoleOrDefault[]);

    // Keep track of whatever role we're editing right now.
    const [selected, setSelected] = useState("default");
    const [value, setValue] = useState<OverrideField | number | undefined>(
        undefined,
    );
    const currentPermission = currentRoles.find(
        (x) => x.id === selected,
    )!.permissions;
    const currentValue = value ?? currentPermission;

    // If a role gets deleted, unselect it immediately.
    useLayoutEffect(() => {
        if (!channel?.server?.roles) return;
        if (!channel.server.roles[selected]) {
            setSelected("default");
        }
    }, [channel.server?.roles]);

    // Upload new role information to server.
    function save() {
        channel.setPermissions(
            selected,
            typeof currentValue === "number"
                ? currentValue
                : {
                      allow: currentValue.a,
                      deny: currentValue.d,
                  },
        );
    }

    return (
        <div style={{ height: "100%", overflowY: "scroll" }}>
            <h1>Select Role</h1>
            <RoleSelection
                selected={selected}
                onSelect={(id) => {
                    setValue(undefined);
                    setSelected(id);
                }}
                roles={currentRoles}
            />
            {!isEqual(currentPermission, currentValue) && (
                <>
                    <hr />
                    <UnsavedChanges save={save} />
                </>
            )}
            <hr />
            <h1>Edit Permissions</h1>
            <PermissionList
                value={currentValue}
                onChange={setValue}
                filter={[
                    "ViewChannel",
                    "ReadMessageHistory",
                    "SendMessage",
                    "ManageMessages",
                    "ManageWebhooks",
                    "InviteOthers",
                    "SendEmbeds",
                    "UploadFiles",
                    "Masquerade",
                ]}
            />
        </div>
    );

    /*const [selected, setSelected] = useState("default");

    type R = { name: string; permissions: number };
    const roles: { [key: string]: R } = {};
    if (channel.channel_type !== "Group") {
        const server = channel.server;
        const a = server?.roles ?? {};
        for (const b of Object.keys(a)) {
            roles[b] = {
                name: a[b].name,
                permissions:
                    channel.role_permissions?.[b] ?? a[b].permissions[1],
            };
        }
    }

    const keys = ["default", ...Object.keys(roles)];

    const defaultRole = {
        name: "Default",
        permissions:
            (channel.channel_type === "Group"
                ? channel.permissions
                : channel.default_permissions) ?? DEFAULT_PERMISSION_DM,
    };
    const selectedRole = selected === "default" ? defaultRole : roles[selected];

    if (!selectedRole) {
        useEffect(() => setSelected("default"), []);
        return null;
    }

    const [p, setPerm] = useState(selectedRole.permissions >>> 0);

    useEffect(() => {
        setPerm(selectedRole.permissions >>> 0);
    }, [selected, selectedRole.permissions]);

    return (
        <div>
            <Tip warning>This section is under construction.</Tip>
            <h2>select role</h2>
            {selected}
            {keys.map((id) => {
                const role: R = id === "default" ? defaultRole : roles[id];

                return (
                    <Checkbox
                        key={id}
                        checked={selected === id}
                        onChange={(selected) => selected && setSelected(id)}>
                        {role.name}
                    </Checkbox>
                );
            })}
            <h2>channel permissions</h2>
            {Object.keys(ChannelPermission).map((perm) => {
                if (perm === "View") return null;

                const value =
                    ChannelPermission[perm as keyof typeof ChannelPermission];
                if (value & DEFAULT_PERMISSION_DM) {
                    return (
                        <Checkbox
                            checked={(p & value) > 0}
                            onChange={(c) =>
                                setPerm(c ? p | value : p ^ value)
                            }>
                            {perm}
                        </Checkbox>
                    );
                }
            })}
            <Button
                contrast
                onClick={() => {
                    channel.setPermissions(selected, p);
                }}>
                click here to save permissions for role
            </Button>
        </div>
    );*/
});
