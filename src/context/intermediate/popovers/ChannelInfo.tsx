import { X } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js";

import styles from "./ChannelInfo.module.scss";

import { Modal } from "@revoltchat/ui";

import Markdown from "../../../components/markdown/Markdown";
import { getChannelName } from "../../revoltjs/util";

interface Props {
    channel: Channel;
    onClose: () => void;
}

export const ChannelInfo = observer(({ channel, onClose }: Props) => {
    if (
        channel.channel_type === "DirectMessage" ||
        channel.channel_type === "SavedMessages"
    ) {
        onClose();
        return null;
    }

    return (
        <Modal onClose={onClose}>
            <div className={styles.info}>
                <div className={styles.header}>
                    <h1>{getChannelName(channel, true)}</h1>
                    <div onClick={onClose}>
                        <X size={36} />
                    </div>
                </div>
                <p>
                    <Markdown content={channel.description!} />
                </p>
            </div>
        </Modal>
    );
});
