import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { User } from "revolt.js/dist/maps/Users";
import styled from "styled-components";

import { Text } from "preact-i18n";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import UserIcon from "./UserIcon";

const BotBadge = styled.div`
    display: inline-block;

    height: 1.4em;
    padding: 0 4px;
    font-size: 0.6em;
    user-select: none;
    margin-inline-start: 2px;
    text-transform: uppercase;

    color: var(--foreground);
    background: var(--accent);
    border-radius: calc(var(--border-radius) / 2);
`;

export const Username = observer(
    ({
        user,
        showServerIdentity,
        ...otherProps
    }: {
        user?: User;
        showServerIdentity?: boolean;
    } & JSX.HTMLAttributes<HTMLElement>) => {
        let username = user?.username;
        let color;

        if (user && showServerIdentity) {
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

        if (user?.bot) {
            return (
                <>
                    <span {...otherProps} style={{ color }}>
                        {username ?? (
                            <Text id="app.main.channel.unknown_user" />
                        )}
                    </span>
                    <BotBadge>
                        <Text id="app.main.channel.bot" />
                    </BotBadge>
                </>
            );
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
    showServerIdentity,
}: {
    user?: User;
    size?: number;
    showServerIdentity?: boolean;
}) {
    const { openScreen } = useIntermediate();
    const openProfile = () =>
        user && openScreen({ id: "profile", user_id: user._id });

    return (
        <>
            <UserIcon
                size={size ?? 24}
                target={user}
                onClick={openProfile}
                showServerIdentity={showServerIdentity}
            />
            <Username
                user={user}
                showServerIdentity={showServerIdentity}
                onClick={openProfile}
            />
        </>
    );
}
