import TextFile from "./TextFile";
import { Text } from "preact-i18n";
import classNames from "classnames";
import styles from "./Attachment.module.scss";
import AttachmentActions from "./AttachmentActions";
import { useContext, useState } from "preact/hooks";
import { AppContext } from "../../../../context/revoltjs/RevoltClient";
import { Attachment as AttachmentRJS } from "revolt.js/dist/api/objects";
import { useIntermediate } from "../../../../context/intermediate/Intermediate";
import { MessageAreaWidthContext } from "../../../../pages/channels/messaging/MessageArea";

interface Props {
    attachment: AttachmentRJS;
    hasContent: boolean;
}

const MAX_ATTACHMENT_WIDTH = 480;

export default function Attachment({ attachment, hasContent }: Props) {
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();
    const { filename, metadata } = attachment;
    const [ spoiler, setSpoiler ] = useState(filename.startsWith("SPOILER_"));

    const url = client.generateFileURL(attachment, { width: MAX_ATTACHMENT_WIDTH * 1.5 }, true);


    switch (metadata.type) {
        case "Image": {
            return (
                <div
                    className={styles.container}
                    onClick={() => spoiler && setSpoiler(false)}
                >
                    {spoiler && (
                        <div className={styles.overflow}>
                            <span><Text id="app.main.channel.misc.spoiler_attachment" /></span>
                        </div>
                    )}
                    <img
                        src={url}
                        alt={filename}
                        data-spoiler={spoiler}
                        data-has-content={hasContent}
                        className={classNames(styles.attachment, styles.image)}
                        onClick={() =>
                            openScreen({ id: "image_viewer", attachment })
                        }
                        onMouseDown={ev =>
                            ev.button === 1 &&
                            window.open(url, "_blank")
                        }
                    />
                </div>
            );
        }
        case "Audio": {
            return (
                <div
                    className={classNames(styles.attachment, styles.audio)}
                    data-has-content={hasContent}
                >
                    <AttachmentActions attachment={attachment} />
                    <audio src={url} controls />
                </div>
            );
        }
        case "Video": {
            return (
                <div
                    className={styles.container}
                    onClick={() => spoiler && setSpoiler(false)}>
                    {spoiler && (
                        <div className={styles.overflow}>
                            <span><Text id="app.main.channel.misc.spoiler_attachment" /></span>
                        </div>
                    )}
                    <div
                        data-spoiler={spoiler}
                        data-has-content={hasContent}
                        className={classNames(styles.attachment, styles.video)}
                    >
                        <AttachmentActions attachment={attachment} />
                        <video
                            src={url}
                            controls
                            onMouseDown={ev =>
                                ev.button === 1 &&
                                window.open(url, "_blank")
                            }
                        />
                    </div>
                </div>
            );
        }
        case 'Text': {
            return (
                <div
                    className={classNames(styles.attachment, styles.text)}
                    data-has-content={hasContent}
                >
                    <TextFile attachment={attachment} />
                    <AttachmentActions attachment={attachment} />
                </div>
            );
        }
        default: {
            return (
                <div
                    className={classNames(styles.attachment, styles.file)}
                    data-has-content={hasContent}
                >
                    <AttachmentActions attachment={attachment} />
                </div>
            );
        }
    }
}
