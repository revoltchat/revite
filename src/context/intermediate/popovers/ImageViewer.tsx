import {
    Attachment,
    AttachmentMetadata,
    EmbedImage,
} from "revolt.js/dist/api/objects";

import styles from "./ImageViewer.module.scss";
import { useContext, useEffect } from "preact/hooks";

import AttachmentActions from "../../../components/common/messaging/attachments/AttachmentActions";
import EmbedMediaActions from "../../../components/common/messaging/embed/EmbedMediaActions";
import Modal from "../../../components/ui/Modal";

import { useClient } from "../../revoltjs/RevoltClient";

interface Props {
    onClose: () => void;
    embed?: EmbedImage;
    attachment?: Attachment;
}

type ImageMetadata = AttachmentMetadata & { type: "Image" };

export function ImageViewer({ attachment, embed, onClose }: Props) {
    if (attachment && attachment.metadata.type !== "Image") {
        console.warn(
            `Attempted to use a non valid attatchment type in the image viewer: ${attachment.metadata.type}`,
        );
        return null;
    }

    const client = useClient();

    return (
        <Modal visible={true} onClose={onClose} noBackground>
            <div className={styles.viewer}>
                {attachment && (
                    <>
                        <img
                            src={client.generateFileURL(attachment)}
                            width={(attachment.metadata as ImageMetadata).width}
                            height={
                                (attachment.metadata as ImageMetadata).height
                            }
                        />
                        <AttachmentActions attachment={attachment} />
                    </>
                )}
                {embed && (
                    <>
                        <img
                            src={client.proxyFile(embed.url)}
                            width={embed.width}
                            height={embed.height}
                        />
                        <EmbedMediaActions embed={embed} />
                    </>
                )}
            </div>
        </Modal>
    );
}
