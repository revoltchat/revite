import { useContext } from "preact/hooks";
import { useHistory } from "react-router-dom";
import { ChannelHeaderProps } from "../ChannelHeader";
import IconButton from "../../../components/ui/IconButton";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { VoiceContext, VoiceOperationsContext, VoiceStatus } from "../../../context/Voice";
import { UserPlus, Settings, Sidebar as SidebarIcon, PhoneCall, PhoneOff } from "@styled-icons/feather";

export default function HeaderActions({ channel, toggleSidebar }: ChannelHeaderProps) {
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);
    const history = useHistory();

    return (
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
            <VoiceActions channel={channel} />
            { (channel.channel_type === "Group" || channel.channel_type === "TextChannel") && !isTouchscreenDevice && (
                <IconButton onClick={toggleSidebar}>
                    <SidebarIcon size={22} />
                </IconButton>
            ) }
        </>
    )
}

function VoiceActions({ channel }: Pick<ChannelHeaderProps, 'channel'>) {
    if (channel.channel_type === 'SavedMessages' ||
        channel.channel_type === 'TextChannel') return null;

    const voice = useContext(VoiceContext);
    const { connect, disconnect } = useContext(VoiceOperationsContext);

    if (voice.status >= VoiceStatus.READY) {
        if (voice.roomId === channel._id) {
            return (
                <IconButton onClick={disconnect}>
                    <PhoneOff size={22} />
                </IconButton>
            )
        } else {
            return (
                <IconButton onClick={() => {
                    disconnect();
                    connect(channel._id);
                }}>
                    <PhoneCall size={22} />
                </IconButton>
            )
        }
    } else {
        return (
            <IconButton>
                <PhoneCall size={22} /** ! FIXME: TEMP */ color="red" />
            </IconButton>
        )
    }
}
