import styled from "styled-components";
import { Channel, User } from "revolt.js";
import { useContext } from "preact/hooks";
import Header from "../../components/ui/Header";
import HeaderActions from "./actions/HeaderActions";
import Markdown from "../../components/markdown/Markdown";
import { getChannelName } from "../../context/revoltjs/util";
import UserStatus from "../../components/common/user/UserStatus";
import { AppContext } from "../../context/revoltjs/RevoltClient";
import { Save, At, Group, Hash } from "@styled-icons/boxicons-regular";
import { useStatusColour } from "../../components/common/user/UserIcon";
import { useIntermediate } from "../../context/intermediate/Intermediate";

export interface ChannelHeaderProps {
    channel: Channel,
    toggleSidebar?: () => void
}

const Info = styled.div`
    flex-grow: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;

    * {
        display: inline-block;
    }

    .divider {
        height: 14px;
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
        font-size: 0.8em;
        font-weight: 400;
        color: var(--secondary-foreground);
    }
`;

export default function ChannelHeader({ channel, toggleSidebar }: ChannelHeaderProps) {
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);

    const name = getChannelName(client, channel);
    let icon, recipient;
    switch (channel.channel_type) {
        case "SavedMessages":
            icon = <Save size={20} />;
            break;
        case "DirectMessage":
            icon = <At size={20} />;
            const uid = client.channels.getRecipient(channel._id);
            recipient = client.users.get(uid);
            break;
        case "Group":
            icon = <Group size={20} />;
            break;
        case "TextChannel":
            icon = <Hash size={20} />;
            break;
    }

    return (
        <Header placement="primary">
            { icon }
            <Info>
                <span className="name">{ name }</span>
                {channel.channel_type === "DirectMessage" && (
                    <>
                        <div className="divider" />
                        <span className="desc">
                            <div className="status" style={{ backgroundColor: useStatusColour(recipient as User) }} />
                            <UserStatus user={recipient as User} />
                        </span>
                    </>
                )}
                {(channel.channel_type === "Group" || channel.channel_type === "TextChannel") && channel.description && (
                    <>
                        <div className="divider" />
                        <span
                            className="desc"
                            onClick={() =>
                                openScreen({
                                    id: "channel_info",
                                    channel_id: channel._id
                                })
                            }>
                            <Markdown content={channel.description.split("\n")[0] ?? ""} disallowBigEmoji />
                        </span>
                    </>
                )}
            </Info>
            <HeaderActions channel={channel} toggleSidebar={toggleSidebar} />
        </Header>
    )
}
