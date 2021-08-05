import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { User } from "revolt.js/dist/maps/Users";

import { Text } from "preact-i18n";

import { useClient } from "../../../context/revoltjs/RevoltClient";

import UserIcon from "./UserIcon";

export const Username = observer(
    ({
        user,
        ...otherProps
    }: { user?: User } & JSX.HTMLAttributes<HTMLElement>) => {
        let username = user?.username;
        let color;

        if (user) {
            const { server } = useParams<{ server?: string }>();
            if (server) {
                const client = useClient();
                const member = client.members.getKey({
                    server,
                    user: user._id,
                });

                if (member) {
                    if (member.nickname) {
                        username = member.nickname;
                    }

                    if (member.roles && member.roles.length > 0) {
                        const srv = client.servers.get(member._id.server);
                        if (srv?.roles) {
                            for (const role of member.roles) {
                                const c = srv.roles[role].colour;
                                if (c) {
                                    color = c;
                                    continue;
                                }
                            }
                        }
                    }
                }
            }
        }

        return (
            <span {...otherProps} style={{ color }}>
                {username ?? <Text id="app.main.channel.unknown_user" />}
            </span>
        );
    },
);

export default function UserShort({
    user,
    size,
}: {
    user?: User;
    size?: number;
}) {
    return (
        <>
            <UserIcon size={size ?? 24} target={user} />
            <Username user={user} />
        </>
    );
}
