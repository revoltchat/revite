import { X } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";

import styles from "./ChannelInfo.module.scss";

import { Channel } from "../../../mobx";

import Modal from "../../../components/ui/Modal";

import Markdown from "../../../components/markdown/Markdown";
import { useClient } from "../../revoltjs/RevoltClient";
import { useForceUpdate } from "../../revoltjs/hooks";
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

    const client = useClient();
    return (
        <Modal visible={true} onClose={onClose}>
            <div className={styles.info}>
                <div className={styles.header}>
                    <h1>{getChannelName(client, channel, true)}</h1>
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
