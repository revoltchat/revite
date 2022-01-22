/* eslint-disable react-hooks/rules-of-hooks */
import { Attachment, AttachmentMetadata } from "revolt-api/types/Autumn";
import { EmbedImage } from "revolt-api/types/January";

import styles from "./ImageViewer.module.scss";

import AttachmentActions from "../../../components/common/messaging/attachments/AttachmentActions";
import EmbedMediaActions from "../../../components/common/messaging/embed/EmbedMediaActions";

import { ModalBound } from "../../../components/util/ModalBound";
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
        <ModalBound
            maxWidth="100%"
            maxHeight="100%"
            onClose={onClose}
            transparent>
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
        </ModalBound>
    );
}
