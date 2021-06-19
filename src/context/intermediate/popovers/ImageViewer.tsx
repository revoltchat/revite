import styles from "./ImageViewer.module.scss";
import Modal from "../../../components/ui/Modal";
import { useContext, useEffect } from "preact/hooks";
import { AppContext } from "../../revoltjs/RevoltClient";
import { Attachment, EmbedImage } from "revolt.js/dist/api/objects";

interface Props {
    onClose: () => void;
    embed?: EmbedImage;
    attachment?: Attachment;
}

export function ImageViewer({ attachment, embed, onClose }: Props) {
    if (attachment && attachment.metadata.type !== "Image") return null;
    const client = useContext(AppContext);

    useEffect(() => {
        function keyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                onClose();
            }
        }

        document.body.addEventListener("keydown", keyDown);
        return () => document.body.removeEventListener("keydown", keyDown);
    }, []);

    return (
        <Modal visible={true} onClose={onClose} noBackground>
            <div className={styles.viewer}>
                { attachment &&
                    <>
                        <img src={client.generateFileURL(attachment)} />
                        {/*<AttachmentActions attachment={attachment} />*/}
                    </>
                }
                { embed &&
                    <>
                        {/*<img src={proxyImage(embed.url)} />*/}
                        {/*<EmbedMediaActions embed={embed} />*/}
                    </>
                }
            </div>
        </Modal>
    );
}
