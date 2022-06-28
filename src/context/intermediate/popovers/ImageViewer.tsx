/* eslint-disable react-hooks/rules-of-hooks */
import { API } from "revolt.js";

import styles from "./ImageViewer.module.scss";

import { Modal } from "@revoltchat/ui";

import AttachmentActions from "../../../components/common/messaging/attachments/AttachmentActions";
import EmbedMediaActions from "../../../components/common/messaging/embed/EmbedMediaActions";
import { useClient } from "../../../controllers/client/ClientController";

interface Props {
    onClose: () => void;
    embed?: API.Image;
    attachment?: API.File;
}

type ImageMetadata = API.Metadata & { type: "Image" };

export function ImageViewer({ attachment, embed, onClose }: Props) {
    if (attachment && attachment.metadata.type !== "Image") {
        console.warn(
            `Attempted to use a non valid attatchment type in the image viewer: ${attachment.metadata.type}`,
        );
        return null;
    }

    const client = useClient();

    return (
        <Modal onClose={onClose} transparent maxHeight="100vh" maxWidth="100vw">
            <div className={styles.viewer}>
                {attachment && (
                    <>
                        <img
                            loading="eager"
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
                            loading="eager"
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
