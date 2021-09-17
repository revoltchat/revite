import { observer } from "mobx-react-lite";
import { Text } from "preact-i18n";
import { useParams } from "react-router-dom";
import { User } from "revolt.js/dist/maps/Users";
import styled from "styled-components";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";
import { internalEmit } from "../../../lib/eventEmitter";
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

const Wrapper = styled.button`
    align-items: center;
    appearance: none;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    border: 0;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    color: inherit;
    cursor: pointer;
    display: flex;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.25s, box-shadow 0.25s;

    svg {
        display: block;
    }

    &:hover {
        background: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3);
    }
`;

const AvatarWrapper = styled.div`
    margin-right: 8px;
`;

type UsernameProps = JSX.HTMLAttributes<HTMLElement> & {
    user?: User;
    prefixAt?: boolean;
    showServerIdentity?: boolean;
};
export const Username = observer(
    ({ user, prefixAt, showServerIdentity, ...otherProps }: UsernameProps) => {
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
                {prefixAt ? "@" : undefined}
                {username ?? <Text id="app.main.channel.unknown_user" />}
            </span>
        );
    },
);

export default function UserShort({
    user,
    size,
    prefixAt,
    showServerIdentity,
}: {
    user?: User;
    size?: number;
    prefixAt?: boolean;
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
        <Wrapper onClick={handleUserClick}>
            <AvatarWrapper>
                <UserIcon
                    size={size ?? 24}
                    target={user}
                    showServerIdentity={showServerIdentity}
                />
            </AvatarWrapper>
            <Username
                user={user}
                showServerIdentity={showServerIdentity}
                prefixAt={prefixAt}
            />
        </Wrapper>
    );
}
