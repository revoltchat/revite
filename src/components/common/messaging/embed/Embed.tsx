import { API } from "revolt.js";

import styles from "./Embed.module.scss";
import classNames from "classnames";
import { useContext } from "preact/hooks";

import { useClient } from "../../../../controllers/client/ClientController";
import { modalController } from "../../../../controllers/modals/ModalController";
import { MessageAreaWidthContext } from "../../../../pages/channels/messaging/MessageArea";
import Markdown from "../../../markdown/Markdown";
import Attachment from "../attachments/Attachment";
import EmbedMedia from "./EmbedMedia";

interface Props {
    embed: API.Embed;
}

const MAX_EMBED_WIDTH = 480;
const MAX_EMBED_HEIGHT = 640;
const CONTAINER_PADDING = 24;
const MAX_PREVIEW_SIZE = 150;

export default function Embed({ embed }: Props) {
    const client = useClient();

    const maxWidth = Math.min(
        useContext(MessageAreaWidthContext) - CONTAINER_PADDING,
        MAX_EMBED_WIDTH,
    );

    function calculateSize(
        w: number,
        h: number,
    ): { width: number; height: number } {
        const limitingWidth = Math.min(maxWidth, w);

        const limitingHeight = Math.min(MAX_EMBED_HEIGHT, h);

        // Calculate smallest possible WxH.
        const width = Math.min(limitingWidth, limitingHeight * (w / h));

        const height = Math.min(limitingHeight, limitingWidth * (h / w));

        return { width, height };
    }

    switch (embed.type) {
        case "Text":
        case "Website": {
            // Determine special embed size.
            let mw, mh;
            const largeMedia =
                embed.type === "Text"
                    ? typeof embed.media !== "undefined"
                    : (embed.special && embed.special.type !== "None") ||
                      embed.image?.size === "Large";

            if (embed.type === "Text") {
                mw = MAX_EMBED_WIDTH;
                mh = 1;
            } else {
                switch (embed.special?.type) {
                    case "YouTube":
                    case "Bandcamp": {
                        mw = embed.video?.width ?? 1280;
                        mh = embed.video?.height ?? 720;
                        break;
                    }
                    case "Twitch":
                    case "Lightspeed":
                    case "Streamable": {
                        mw = 1280;
                        mh = 720;
                        break;
                    }
                    default: {
                        if (embed.image?.size === "Preview") {
                            mw = MAX_EMBED_WIDTH;
                            mh = Math.min(
                                embed.image.height ?? 0,
                                MAX_PREVIEW_SIZE,
                            );
                        } else {
                            mw = embed.image?.width ?? MAX_EMBED_WIDTH;
                            mh = embed.image?.height ?? 0;
                        }
                    }
                }
            }

            const { width, height } = calculateSize(mw, mh);
            if (embed.type === "Website" && embed.special?.type === "GIF") {
                return (
                    <EmbedMedia
                        embed={embed}
                        width={
                            height *
                            ((embed.image?.width ?? 0) /
                                (embed.image?.height ?? 0))
                        }
                        height={height}
                    />
                );
            }

            return (
                <div
                    className={classNames(styles.embed, styles.website)}
                    style={{
                        borderInlineStartColor:
                            embed.colour ?? "var(--tertiary-background)",
                        width: width + CONTAINER_PADDING,
                    }}>
                    <div>
                        {(embed.type === "Text"
                            ? embed.title
                            : embed.site_name) && (
                            <div className={styles.siteinfo}>
                                {embed.icon_url && (
                                    <img
                                        loading="lazy"
                                        className={styles.favicon}
                                        src={client.proxyFile(embed.icon_url)}
                                        draggable={false}
                                        onError={(e) =>
                                            (e.currentTarget.style.display =
                                                "none")
                                        }
                                    />
                                )}
                                <div className={styles.site}>
                                    {embed.type === "Text"
                                        ? embed.title
                                        : embed.site_name}{" "}
                                </div>
                            </div>
                        )}

                        {/*<span><a href={embed.url} target={"_blank"} className={styles.author}>Author</a></span>*/}
                        {embed.type === "Website" && embed.title && (
                            <span>
                                <a
                                    onMouseDown={(ev) =>
                                        (ev.button === 0 || ev.button === 1) &&
                                        modalController.openLink(
                                            embed.url!,
                                            undefined,
                                            true,
                                        )
                                    }
                                    className={styles.title}>
                                    {embed.title}
                                </a>
                            </span>
                        )}
                        {embed.description &&
                            (embed.type === "Text" ? (
                                <Markdown content={embed.description} />
                            ) : (
                                <div className={styles.description}>
                                    {embed.description}
                                </div>
                            ))}

                        {largeMedia &&
                            (embed.type === "Text" ? (
                                <Attachment attachment={embed.media!} />
                            ) : (
                                <EmbedMedia embed={embed} height={height} />
                            ))}
                    </div>
                    {!largeMedia && embed.type === "Website" && (
                        <div>
                            <EmbedMedia
                                embed={embed}
                                width={
                                    height *
                                    ((embed.image?.width ?? 0) /
                                        (embed.image?.height ?? 0))
                                }
                                height={height}
                            />
                        </div>
                    )}
                </div>
            );
        }
        case "Image": {
            return (
                <img
                    className={classNames(styles.embed, styles.image)}
                    style={calculateSize(embed.width, embed.height)}
                    src={client.proxyFile(embed.url)}
                    type="text/html"
                    frameBorder="0"
                    loading="lazy"
                    onClick={() =>
                        modalController.push({ type: "image_viewer", embed })
                    }
                    onMouseDown={(ev) =>
                        ev.button === 1 &&
                        modalController.openLink(embed.url, undefined, true)
                    }
                />
            );
        }
        case "Video": {
            return (
                <video
                    className={classNames(styles.embed, styles.image)}
                    style={calculateSize(embed.width, embed.height)}
                    src={client.proxyFile(embed.url)}
                    frameBorder="0"
                    loading="lazy"
                    controls
                />
            );
        }
        default:
            return null;
    }
}
