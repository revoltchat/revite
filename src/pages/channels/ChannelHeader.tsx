import { At, Hash, Menu } from "@styled-icons/boxicons-regular";
import { Notepad, Group } from "@styled-icons/boxicons-solid";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js";
import styled from "styled-components";

import { useContext } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { User } from "../../mobx";
import { useData } from "../../mobx/State";

import { useIntermediate } from "../../context/intermediate/Intermediate";
import { AppContext, useClient } from "../../context/revoltjs/RevoltClient";
import { getChannelName } from "../../context/revoltjs/util";

import { useStatusColour } from "../../components/common/user/UserIcon";
import UserStatus from "../../components/common/user/UserStatus";
import Header from "../../components/ui/Header";

import Markdown from "../../components/markdown/Markdown";
import HeaderActions from "./actions/HeaderActions";

export interface ChannelHeaderProps {
    channel: Channel;
    toggleSidebar?: () => void;
}

const Info = styled.div`
    flex-grow: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;

    display: flex;
    gap: 8px;
    align-items: center;

    * {
        display: inline-block;
    }

    .divider {
        height: 20px;
        margin: 0 5px;
        padding-left: 1px;
        background-color: var(--tertiary-background);
    }

    .status {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin-inline-end: 6px;
    }

    .desc {
        cursor: pointer;
        margin-top: 2px;
        font-size: 0.8em;
        font-weight: 400;
        color: var(--secondary-foreground);

        > * {
            pointer-events: none;
        }
    }
`;

export default observer(({ channel, toggleSidebar }: ChannelHeaderProps) => {
    const { openScreen } = useIntermediate();
    const client = useClient();
    const state = useData();

    const name = getChannelName(client, channel);
    let icon, recipient: User | undefined;
    switch (channel.channel_type) {
        case "SavedMessages":
            icon = <Notepad size={24} />;
            break;
        case "DirectMessage":
            icon = <At size={24} />;
            const uid = client.channels.getRecipient(channel._id);
            recipient = state.users.get(uid);
            break;
        case "Group":
            icon = <Group size={24} />;
            break;
        case "TextChannel":
            icon = <Hash size={24} />;
            break;
    }

    return (
        <Header placement="primary">
            {isTouchscreenDevice && (
                <div className="menu">
                    <Menu size={27} />
                </div>
            )}
            {icon}
            <Info>
                <span className="name">{name}</span>
                {isTouchscreenDevice &&
                    channel.channel_type === "DirectMessage" && (
                        <>
                            <div className="divider" />
                            <span className="desc">
                                <div
                                    className="status"
                                    style={{
                                        backgroundColor:
                                            useStatusColour(recipient),
                                    }}
                                />
                                <UserStatus user={recipient} />
                            </span>
                        </>
                    )}
                {!isTouchscreenDevice &&
                    (channel.channel_type === "Group" ||
                        channel.channel_type === "TextChannel") &&
                    channel.description && (
                        <>
                            <div className="divider" />
                            <span
                                className="desc"
                                onClick={() =>
                                    openScreen({
                                        id: "channel_info",
                                        channel_id: channel._id,
                                    })
                                }>
                                <Markdown
                                    content={
                                        channel.description.split("\n")[0] ?? ""
                                    }
                                    disallowBigEmoji
                                />
                            </span>
                        </>
                    )}
            </Info>
            <HeaderActions channel={channel} toggleSidebar={toggleSidebar} />
        </Header>
    );
});
