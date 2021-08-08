import { observer } from "mobx-react-lite";
import { RelationshipStatus } from "revolt-api/types/Users";
import { Channel } from "revolt.js/dist/maps/Channels";
import styled from "styled-components";

import { Text } from "preact-i18n";

interface Props {
    channel: Channel;
}

const Base = styled.div`
    position: relative;

    > div {
        height: 24px;
        margin-top: -24px;
        position: absolute;

        gap: 8px;
        display: flex;
        padding: 0 10px;
        user-select: none;
        align-items: center;
        flex-direction: row;
        width: calc(100% - 3px);
        color: var(--secondary-foreground);
        background: var(--secondary-background);
    }

    .avatars {
        display: flex;

        img {
            width: 16px;
            height: 16px;
            object-fit: cover;
            border-radius: 50%;

            &:not(:first-child) {
                margin-left: -4px;
            }
        }
    }

    .usernames {
        min-width: 0;
        font-size: 13px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

export default observer(({ channel }: Props) => {
    const users = channel.typing.filter(
        (x) =>
            typeof x !== "undefined" &&
            x._id !== x.client.user!._id &&
            x.relationship !== RelationshipStatus.Blocked,
    );

    if (users.length > 0) {
        users.sort((a, b) =>
            a!._id.toUpperCase().localeCompare(b!._id.toUpperCase()),
        );

        let text;
        if (users.length >= 5) {
            text = <Text id="app.main.channel.typing.several" />;
        } else if (users.length > 1) {
            const userlist = [...users].map((x) => x!.username);
            const user = userlist.pop();

            text = (
                <Text
                    id="app.main.channel.typing.multiple"
                    fields={{
                        user,
                        userlist: userlist.join(", "),
                    }}
                />
            );
        } else {
            text = (
                <Text
                    id="app.main.channel.typing.single"
                    fields={{ user: users[0]!.username }}
                />
            );
        }

        return (
            <Base>
                <div>
                    <div className="avatars">
                        {users.map((user) => (
                            <img
                                key={user!._id}
                                loading="eager"
                                src={user!.generateAvatarURL({ max_side: 256 })}
                            />
                        ))}
                    </div>
                    <div className="usernames">{text}</div>
                </div>
            </Base>
        );
    }

    return null;
});
