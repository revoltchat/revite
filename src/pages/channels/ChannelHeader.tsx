import styled from "styled-components";
import { Channel, User } from "revolt.js";
import { useContext } from "preact/hooks";
import { useHistory } from "react-router-dom";
import Header from "../../components/ui/Header";
import IconButton from "../../components/ui/IconButton";
import Markdown from "../../components/markdown/Markdown";
import { getChannelName } from "../../context/revoltjs/util";
import UserStatus from "../../components/common/user/UserStatus";
import { AppContext } from "../../context/revoltjs/RevoltClient";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";
import { useStatusColour } from "../../components/common/user/UserIcon";
import { useIntermediate } from "../../context/intermediate/Intermediate";
import { Save, AtSign, Users, Hash, UserPlus, Settings, Sidebar as SidebarIcon } from "@styled-icons/feather";

interface Props {
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

export default function ChannelHeader({ channel, toggleSidebar }: Props) {
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);
    const history = useHistory();

    const name = getChannelName(client, channel);
    let icon, recipient;
    switch (channel.channel_type) {
        case "SavedMessages":
            icon = <Save size={20} strokeWidth={1.5} />;
            break;
        case "DirectMessage":
            icon = <AtSign size={20} strokeWidth={1.5} />;
            const uid = client.channels.getRecipient(channel._id);
            recipient = client.users.get(uid);
            break;
        case "Group":
            icon = <Users size={20} strokeWidth={1.5} />;
            break;
        case "TextChannel":
            icon = <Hash size={20} strokeWidth={1.5} />;
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
            <>
                { channel.channel_type === "Group" && (
                    <>
                        <IconButton onClick={() =>
                            openScreen({
                                id: "user_picker",
                                omit: channel.recipients,
                                callback: async users => {
                                    for (const user of users) {
                                        await client.channels.addMember(channel._id, user);
                                    }
                                }
                            })}>
                            <UserPlus size={22} />
                        </IconButton>
                        <IconButton onClick={() => history.push(`/channel/${channel._id}/settings`)}>
                            <Settings size={22} />
                        </IconButton>
                    </>
                ) }
                { channel.channel_type === "Group" && !isTouchscreenDevice && (
                    <IconButton onClick={toggleSidebar}>
                        <SidebarIcon size={22} />
                    </IconButton>
                ) }
            </>
        </Header>
    )
}
