import {
    UserPlus,
    Cog,
    PhoneCall,
    PhoneOutgoing,
    Group,
} from "@styled-icons/boxicons-solid";
import { useHistory } from "react-router-dom";

import { useContext } from "preact/hooks";

import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import {
    VoiceContext,
    VoiceOperationsContext,
    VoiceStatus,
} from "../../../context/Voice";
import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

import UpdateIndicator from "../../../components/common/UpdateIndicator";
import IconButton from "../../../components/ui/IconButton";

import { ChannelHeaderProps } from "../ChannelHeader";

export default function HeaderActions({
    channel,
    toggleSidebar,
}: ChannelHeaderProps) {
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);
    const history = useHistory();

    return (
        <>
            <UpdateIndicator />
            {channel.channel_type === "Group" && (
                <>
                    <IconButton
                        onClick={() =>
                            openScreen({
                                id: "user_picker",
                                omit: channel.recipients!,
                                callback: async (users) => {
                                    for (const user of users) {
                                        await client.channels.addMember(
                                            channel._id,
                                            user,
                                        );
                                    }
                                },
                            })
                        }>
                        <UserPlus size={27} />
                    </IconButton>
                    <IconButton
                        onClick={() =>
                            history.push(`/channel/${channel._id}/settings`)
                        }>
                        <Cog size={24} />
                    </IconButton>
                </>
            )}
            <VoiceActions channel={channel} />
            {(channel.channel_type === "Group" ||
                channel.channel_type === "TextChannel") && (
                <IconButton onClick={toggleSidebar}>
                    <Group size={25} />
                </IconButton>
            )}
        </>
    );
}

function VoiceActions({ channel }: Pick<ChannelHeaderProps, "channel">) {
    if (
        channel.channel_type === "SavedMessages" ||
        channel.channel_type === "TextChannel"
    )
        return null;

    const voice = useContext(VoiceContext);
    const { connect, disconnect } = useContext(VoiceOperationsContext);

    if (voice.status >= VoiceStatus.READY) {
        if (voice.roomId === channel._id) {
            return (
                <IconButton onClick={disconnect}>
                    <PhoneOutgoing size={22} />
                </IconButton>
            );
        }
        return (
            <IconButton
                onClick={() => {
                    disconnect();
                    connect(channel._id);
                }}>
                <PhoneCall size={24} />
            </IconButton>
        );
    }
    return (
        <IconButton>
            <PhoneCall size={24} /** ! FIXME: TEMP */ color="red" />
        </IconButton>
    );
}
