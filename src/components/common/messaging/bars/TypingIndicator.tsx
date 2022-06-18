import { observer } from "mobx-react-lite";
import { Channel, Member } from "revolt.js";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";

interface Props {
    channel: Channel;
}

const Base = styled.div`
    position: relative;

    > div {
        height: 26px;
        top: -26px;
        position: absolute;
        font-size: 13px;
        gap: 8px;
        display: flex;
        padding: 0 10px;
        user-select: none;
        align-items: center;
        flex-direction: row;
        width: calc(100% - var(--scrollbar-thickness));
        color: var(--secondary-foreground);
        background-color: rgba(
            var(--secondary-background-rgb),
            max(var(--min-opacity), 0.75)
        );
        backdrop-filter: blur(10px);
    }

    .avatars {
        display: flex;

        img {
            width: 16px;
            height: 16px;
            object-fit: cover;
            border-radius: var(--border-radius-half);
            background: var(--secondary-background);
            //background-clip: border-box;
            border: 2px solid var(--secondary-background);

            &:not(:first-child) {
                margin-left: -6px;
            }
        }
    }

    .usernames {
        min-width: 0;
        font-size: 13px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        //font-weight: 600;
    }
`;

export default observer(({ channel }: Props) => {
    const client = channel.client;

    const users = channel.typing.filter(
        (x) =>
            typeof x !== "undefined" &&
            x._id !== x.client.user!._id &&
            x.relationship !== "Blocked",
    );

    const members = users.map((user) => {
        return client.members.getKey({
            server: channel.server_id!,
            user: user!._id,
        });
    });

    const getName = (member: Member) => {
        return member.nickname === null
            ? member.user?.username
            : member.nickname;
    };

    const getAvatar = (member: Member) => {
        const memberAvatarURL = member.generateAvatarURL({
            max_side: 256,
        });

        return memberAvatarURL === undefined
            ? member.user?.generateAvatarURL({ max_side: 256 })
            : memberAvatarURL;
    };

    if (members.length > 0) {
        members.sort((a, b) =>
            a!._id.user.toUpperCase().localeCompare(b!._id.user.toUpperCase()),
        );

        let text;
        if (members.length >= 5) {
            text = <Text id="app.main.channel.typing.several" />;
        } else if (members.length > 1) {
            const memberlist = [...members].map((x) => getName(x!));
            const member = memberlist.pop();

            text = (
                <Text
                    id="app.main.channel.typing.multiple"
                    fields={{
                        user: member,
                        userlist: memberlist.join(", "),
                    }}
                />
            );
        } else {
            text = (
                <Text
                    id="app.main.channel.typing.single"
                    fields={{ user: getName(members[0]!) }}
                />
            );
        }

        return (
            <Base>
                <div>
                    <div className="avatars">
                        {members.map((member) => (
                            <img
                                key={member!._id.user}
                                loading="eager"
                                src={getAvatar(member!)}
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
