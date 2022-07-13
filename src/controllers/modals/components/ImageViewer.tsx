import styled from "styled-components";

import { Modal } from "@revoltchat/ui";

import AttachmentActions from "../../../components/common/messaging/attachments/AttachmentActions";
import EmbedMediaActions from "../../../components/common/messaging/embed/EmbedMediaActions";
import { useClient } from "../../client/ClientController";
import { ModalProps } from "../types";

const Viewer = styled.div`
    display: flex;
    overflow: hidden;
    flex-direction: column;
    border-end-end-radius: 4px;
    border-end-start-radius: 4px;

    max-width: 100vw;

    img {
        width: auto;
        height: auto;
        max-width: 90vw;
        max-height: 75vh;
        object-fit: contain;
        border-bottom: thin solid var(--tertiary-foreground);

        -webkit-touch-callout: default;
    }
`;

export default function ImageViewer({
    embed,
    attachment,
    ...props
}: ModalProps<"image_viewer">) {
    const client = useClient();

    if (attachment && attachment.metadata.type !== "Image") {
        console.warn(
            `Attempted to use a non valid attatchment type in the image viewer: ${attachment.metadata.type}`,
        );
        return null;
    }

    return (
        <Modal {...props} transparent maxHeight="100vh" maxWidth="100vw">
            <Viewer>
                {attachment && (
                    <>
                        <img
                            loading="eager"
                            src={client.generateFileURL(attachment)}
                            width={(attachment.metadata as any).width}
                            height={(attachment.metadata as any).height}
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
            </Viewer>
        </Modal>
    );
}
