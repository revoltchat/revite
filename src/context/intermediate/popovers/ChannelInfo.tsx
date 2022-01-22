import { X } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js/dist/maps/Channels";

import styles from "./ChannelInfo.module.scss";

import Markdown from "../../../components/markdown/Markdown";
import { ModalBound } from "../../../components/util/ModalBound";
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
        <ModalBound onClose={onClose}>
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
        </ModalBound>
    );
});
