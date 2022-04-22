import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { Channel, API } from "revolt.js";
import { DEFAULT_PERMISSION_DIRECT_MESSAGE } from "revolt.js/esm/api/permissions";

import { useState } from "preact/hooks";

import { PermissionsLayout, Button, SpaceBetween, H1 } from "@revoltchat/ui";

import { PermissionList } from "../../../components/settings/roles/PermissionList";
import { RoleOrDefault } from "../../../components/settings/roles/RoleSelection";
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
                      permissions:
                          channel.permissions ??
                          DEFAULT_PERMISSION_DIRECT_MESSAGE,
                  },
              ] as RoleOrDefault[])
            : (useRoles(channel.server! as any).map((role) => {
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

    return (
        <PermissionsLayout
            channel={channel}
            editor={({ selected }) => {
                const currentRole = currentRoles.find(
                    (x) => x.id === selected,
                )!;

                if (!currentRole) return null;

                // Keep track of whatever role we're editing right now.
                const [value, setValue] = useState<
                    API.OverrideField | number | undefined
                >(undefined);
                const currentPermission = currentRoles.find(
                    (x) => x.id === selected,
                )!.permissions;
                const currentValue = value ?? currentPermission;

                // Upload new role information to server.
                function save() {
                    channel.setPermissions(
                        selected,
                        typeof currentValue === "number"
                            ? currentValue
                            : ({
                                  allow: currentValue.a,
                                  deny: currentValue.d,
                              } as any),
                    );
                }

                return (
                    <div>
                        <SpaceBetween>
                            <H1>Permissions for {currentRole.name}</H1>
                            <Button
                                palette="secondary"
                                disabled={isEqual(
                                    currentPermission,
                                    currentValue,
                                )}
                                onClick={save}>
                                Save
                            </Button>
                        </SpaceBetween>
                        <PermissionList
                            value={currentValue}
                            onChange={setValue}
                            filter={[
                                ...(channel.channel_type === "Group"
                                    ? []
                                    : ["ViewChannel" as "ViewChannel"]),
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
            }}
        />
    );
});
