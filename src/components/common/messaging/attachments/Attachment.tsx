import "@vime/core/themes/default.css";
import {
    Player,
    Video,
    Ui,
    DblClickFullscreen,
    Controls,
    PlaybackControl,
    FullscreenControl,
    TimeProgress,
    LiveIndicator,
    ScrubberControl,
    ControlGroup,
    ControlSpacer,
    MuteControl,
    Skeleton,
    Scrim,
    Spinner,
} from "@vime/react";
import { Attachment as AttachmentI } from "revolt-api/types/Autumn";

import styles from "./Attachment.module.scss";
import classNames from "classnames";
import { useContext, useState } from "preact/hooks";

import { useIntermediate } from "../../../../context/intermediate/Intermediate";
import { AppContext } from "../../../../context/revoltjs/RevoltClient";

import AttachmentActions from "./AttachmentActions";
import { SizedGrid } from "./Grid";
import ImageFile from "./ImageFile";
import Spoiler from "./Spoiler";
import TextFile from "./TextFile";

interface Props {
    attachment: AttachmentI;
    hasContent: boolean;
}

const MAX_ATTACHMENT_WIDTH = 480;

export default function Attachment({ attachment, hasContent }: Props) {
    const client = useContext(AppContext);
    const { filename, metadata, content_type } = attachment;
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
                    width={metadata.width / 2}
                    height={metadata.height / 2}
                    className={classNames({
                        [styles.margin]: hasContent,
                        spoiler,
                    })}>
                    <ImageFile attachment={attachment} />
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
                        <Player
                            mediaTitle={filename}
                            theme="dark"
                            style={
                                {
                                    "--vm-player-theme": "var(--accent)",
                                } as React.CSSProperties
                            }>
                            <Video>
                                <source data-src={url} type={content_type} />
                            </Video>
                            <Ui>
                                <DblClickFullscreen />
                                <Skeleton
                                    style={
                                        {
                                            "--vm-skeleton-color":
                                                "var(--secondary-background)",
                                            "--vm-skeleton-sheen-color":
                                                "var(--tertiary-background)",
                                        } as React.CSSProperties
                                    }
                                />
                                <Scrim gradient="up" />
                                <Spinner />
                                <Controls>
                                    <LiveIndicator />
                                    <ScrubberControl />
                                    <ControlGroup>
                                        <PlaybackControl
                                            tooltipDirection="right"
                                            keys={undefined}
                                        />
                                        <MuteControl keys={undefined} />
                                        <TimeProgress />
                                        <ControlSpacer />
                                        <FullscreenControl
                                            tooltipDirection="left"
                                            keys={undefined}
                                        />
                                    </ControlGroup>
                                </Controls>
                            </Ui>
                        </Player>

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
