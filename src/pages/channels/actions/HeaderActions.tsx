/* eslint-disable react-hooks/rules-of-hooks */
import {
    UserPlus,
    Cog,
    PhoneCall,
    PhoneOff,
    Group,
} from "@styled-icons/boxicons-solid";
import { useHistory } from "react-router-dom";

import { useContext } from "preact/hooks";

import {
    VoiceContext,
    VoiceOperationsContext,
    VoiceStatus,
} from "../../../context/Voice";
import { useIntermediate } from "../../../context/intermediate/Intermediate";

import UpdateIndicator from "../../../components/common/UpdateIndicator";
import IconButton from "../../../components/ui/IconButton";

import { ChannelHeaderProps } from "../ChannelHeader";

export default function HeaderActions({
    channel,
    toggleSidebar,
}: ChannelHeaderProps) {
    const { openScreen } = useIntermediate();
    const history = useHistory();

    return (
        <>
            <UpdateIndicator style="channel" />
            {channel.channel_type === "Group" && (
                <>
                    <IconButton
                        onClick={() =>
                            openScreen({
                                id: "user_picker",
                                omit: channel.recipient_ids!,
                                callback: async (users) => {
                                    for (const user of users) {
                                        await channel.addMember(user);
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
                    <PhoneOff size={22} />
                </IconButton>
            );
        }
        return (
            <IconButton
                onClick={() => {
                    disconnect();
                    connect(channel);
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
