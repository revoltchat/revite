import { observer } from "mobx-react-lite";
import { RelationshipStatus } from "revolt-api/types/Users";
import { Channel } from "revolt.js/dist/maps/Channels";
import styled from "styled-components";

import { Text } from "preact-i18n";

import { TextReact } from "../../../../lib/i18n";

import UserIcon from "../../user/UserIcon";
import { Username } from "../../user/UserShort";

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

        :not(:first-child) {
            margin-left: -4px;
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
            const userlist = [...users].map((x) => (
                <Username key={x!._id} user={x} showServerIdentity />
            ));
            //const user = userlist.pop();

            for (let i = 0; i < userlist.length - 1; i++) {
                userlist.splice(i * 2 + 1, 0, <span key={`sep_${i}`}>, </span>);
            }

            text = (
                userlist
                /*<TextReact
                    id="app.main.channel.typing.multiple"
                    fields={{
                        user,
                        userlist,
                    }}
                />*/
            );
        } else {
            text = (
                <Username user={users[0]} showServerIdentity />
                /*<TextReact
                    id="app.main.channel.typing.single"
                    fields={{
                        user: <Username user={users[0]} showServerIdentity />,
                    }}
                />*/
            );
        }

        return (
            <Base>
                <div>
                    <div className="avatars">
                        {users.map((user) => (
                            <UserIcon
                                key={user!._id}
                                target={user}
                                size={16}
                                showServerIdentity
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
