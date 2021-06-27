import { X } from "@styled-icons/boxicons-regular";
import styles from "./ChannelInfo.module.scss";
import Modal from "../../../components/ui/Modal";
import { getChannelName } from "../../revoltjs/util";
import Markdown from "../../../components/markdown/Markdown";
import { useChannel, useForceUpdate } from "../../revoltjs/hooks";

interface Props {
    channel_id: string;
    onClose: () => void;
}

export function ChannelInfo({ channel_id, onClose }: Props) {
    const ctx = useForceUpdate();
    const channel = useChannel(channel_id, ctx);
    if (!channel) return null;

    if (channel.channel_type === "DirectMessage" || channel.channel_type === 'SavedMessages') {
        onClose();
        return null;
    }

    return (
        <Modal visible={true} onClose={onClose}>
            <div className={styles.info}>
                <div className={styles.header}>
                    <h1>{ getChannelName(ctx.client, channel, true) }</h1>
                    <div onClick={onClose}>
                        <X size={36} />
                    </div>
                </div>
                <p>
                    <Markdown content={channel.description} />
                </p>
            </div>
        </Modal>
    );
}
