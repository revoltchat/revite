import { API } from "revolt.js";

import styles from "./Attachment.module.scss";
import classNames from "classnames";
import { useTriggerEvents } from "preact-context-menu";
import { useState } from "preact/hooks";

import { useClient } from "../../../../controllers/client/ClientController";
import AttachmentActions from "./AttachmentActions";
import { SizedGrid } from "./Grid";
import ImageFile from "./ImageFile";
import Spoiler from "./Spoiler";
import TextFile from "./TextFile";

interface Props {
    attachment: API.File;
    hasContent?: boolean;
}

const MAX_ATTACHMENT_WIDTH = 480;

export default function Attachment({ attachment, hasContent }: Props) {
    const client = useClient();
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
                    {...useTriggerEvents("Menu", {
                        attachment,
                    })}
                    className={classNames({
                        [styles.margin]: hasContent,
                        spoiler,
                    })}>
                    <ImageFile
                        attachment={attachment}
                        width={metadata.width}
                        height={metadata.height}
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
