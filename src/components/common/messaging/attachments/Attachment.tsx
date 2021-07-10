import { Attachment as AttachmentRJS } from "revolt.js/dist/api/objects";

import styles from "./Attachment.module.scss";
import classNames from "classnames";
import { useContext, useState } from "preact/hooks";

import { useIntermediate } from "../../../../context/intermediate/Intermediate";
import { AppContext } from "../../../../context/revoltjs/RevoltClient";

import AttachmentActions from "./AttachmentActions";
import { SizedGrid } from "./Grid";
import Spoiler from "./Spoiler";
import TextFile from "./TextFile";

interface Props {
    attachment: AttachmentRJS;
    hasContent: boolean;
}

const MAX_ATTACHMENT_WIDTH = 480;

export default function Attachment({ attachment, hasContent }: Props) {
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();
    const { filename, metadata } = attachment;
    const [spoiler, setSpoiler] = useState(filename.startsWith("SPOILER_"));

    const url = client.generateFileURL(
        attachment,
        { width: MAX_ATTACHMENT_WIDTH * 1.5 },
        true,
    );

    switch (metadata.type) {
        case "Image": {
            return (
                <SizedGrid
                    width={metadata.width}
                    height={metadata.height}
                    className={classNames({
                        [styles.margin]: hasContent,
                        spoiler,
                    })}>
                    <img
                        src={url}
                        alt={filename}
                        className={styles.image}
                        loading="lazy"
                        onClick={() =>
                            openScreen({ id: "image_viewer", attachment })
                        }
                        onMouseDown={(ev) =>
                            ev.button === 1 && window.open(url, "_blank")
                        }
                    />
                    {spoiler && <Spoiler set={setSpoiler} />}
                </SizedGrid>
            );
        }

        case "Video": {
            return (
                <div
                    className={classNames(styles.container, {
                        [styles.margin]: hasContent,
                    })}
                    style={{ "--width": `${metadata.width}px` }}>
                    <AttachmentActions attachment={attachment} />
                    <SizedGrid
                        width={metadata.width}
                        height={metadata.height}
                        className={classNames({ spoiler })}>
                        <video
                            src={url}
                            alt={filename}
                            controls
                            loading="lazy"
                            width={metadata.width}
                            height={metadata.height}
                            onMouseDown={(ev) =>
                                ev.button === 1 && window.open(url, "_blank")
                            }
                        />
                        {spoiler && <Spoiler set={setSpoiler} />}
                    </SizedGrid>
                </div>
            );
        }

        case "Audio": {
            return (
                <div
                    className={classNames(styles.attachment, styles.audio)}
                    data-has-content={hasContent}>
                    <AttachmentActions attachment={attachment} />
                    <audio src={url} controls />
                </div>
            );
        }

        case "Text": {
            return (
                <div
                    className={classNames(styles.attachment, styles.text)}
                    data-has-content={hasContent}>
                    <TextFile attachment={attachment} />
                    <AttachmentActions attachment={attachment} />
                </div>
            );
        }

        default: {
            return (
                <div
                    className={classNames(styles.attachment, styles.file)}
                    data-has-content={hasContent}>
                    <AttachmentActions attachment={attachment} />
                </div>
            );
        }
    }
}
