import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Masquerade } from "revolt-api/types/Channels";
import { User } from "revolt.js/dist/maps/Users";
import { Nullable } from "revolt.js/dist/util/null";
import styled from "styled-components";

import { Text } from "preact-i18n";

import { internalEmit } from "../../../lib/eventEmitter";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import UserIcon from "./UserIcon";

const BotBadge = styled.div`
    display: inline-block;

    height: 1.4em;
    padding: 2px 4px;
    font-size: 0.6em;
    user-select: none;
    margin-inline-start: 2px;
    text-transform: uppercase;

    color: var(--foreground);
    background: var(--accent);
    border-radius: calc(var(--border-radius) / 2);
`;

type UsernameProps = JSX.HTMLAttributes<HTMLElement> & {
    user?: User;
    prefixAt?: boolean;
    masquerade?: Masquerade;
    showServerIdentity?: boolean | "both";
};

export const Username = observer(
    ({
        user,
        prefixAt,
        masquerade,
        showServerIdentity,
        ...otherProps
    }: UsernameProps) => {
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
                        if (showServerIdentity === "both") {
                            username = `${member.nickname} (${username})`;
                        } else {
                            username = member.nickname;
                        }
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
                        {masquerade?.name ?? username ?? (
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
                {prefixAt ? "@" : undefined}
                {masquerade?.name ?? username ?? (
                    <Text id="app.main.channel.unknown_user" />
                )}
            </span>
        );
    },
);

export default function UserShort({
    user,
    size,
    prefixAt,
    masquerade,
    showServerIdentity,
}: {
    user?: User;
    size?: number;
    prefixAt?: boolean;
    masquerade?: Masquerade;
    showServerIdentity?: boolean;
}) {
    const { openScreen } = useIntermediate();
    const openProfile = () =>
        user && openScreen({ id: "profile", user_id: user._id });

    const handleUserClick = (e: MouseEvent) => {
        if (e.shiftKey && user?._id) {
            e.preventDefault();
            internalEmit("MessageBox", "append", `<@${user?._id}>`, "mention");
        } else {
            openProfile();
        }
    };

    return (
        <>
            <UserIcon
                target={user}
                size={size ?? 24}
                masquerade={masquerade}
                onClick={handleUserClick}
                showServerIdentity={showServerIdentity}
            />
            <Username
                user={user}
                prefixAt={prefixAt}
                masquerade={masquerade}
                onClick={handleUserClick}
                showServerIdentity={showServerIdentity}
            />
        </>
    );
}
