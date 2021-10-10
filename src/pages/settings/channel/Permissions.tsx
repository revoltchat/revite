import { observer } from "mobx-react-lite";
import {
    ChannelPermission,
    DEFAULT_PERMISSION_DM,
} from "revolt.js/dist/api/permissions";
import { Channel } from "revolt.js/dist/maps/Channels";

import { useEffect, useState } from "preact/hooks";

import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";

interface Props {
    channel: Channel;
}

// ! FIXME: bad code :)
export default observer(({ channel }: Props) => {
    const [selected, setSelected] = useState("default");

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
    );
});
