import { Embed as EmbedI } from "revolt-api/types/January";

import styles from "./Embed.module.scss";
import classNames from "classnames";
import { useContext } from "preact/hooks";

import { useIntermediate } from "../../../../context/intermediate/Intermediate";
import { useClient } from "../../../../context/revoltjs/RevoltClient";

import { MessageAreaWidthContext } from "../../../../pages/channels/messaging/MessageArea";
import EmbedMedia from "./EmbedMedia";

interface Props {
    embed: EmbedI;
}

const MAX_EMBED_WIDTH = 480;
const MAX_EMBED_HEIGHT = 640;
const CONTAINER_PADDING = 24;
const MAX_PREVIEW_SIZE = 150;

export default function Embed({ embed }: Props) {
    const client = useClient();

    const { openScreen } = useIntermediate();
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
        case "Website": {
            // Determine special embed size.
            let mw, mh;
            const largeMedia =
                (embed.special && embed.special.type !== "None") ||
                embed.image?.size === "Large";
            switch (embed.special?.type) {
                case "YouTube":
                case "Bandcamp": {
                    mw = embed.video?.width ?? 1280;
                    mh = embed.video?.height ?? 720;
                    break;
                }
                case "Twitch": {
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

            const { width, height } = calculateSize(mw, mh);
            return (
                <div
                    className={classNames(styles.embed, styles.website)}
                    style={{
                        borderInlineStartColor:
                            embed.color ?? "var(--tertiary-background)",
                        width: width + CONTAINER_PADDING,
                    }}>
                    <div>
                        {embed.site_name && (
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
                                    {embed.site_name}{" "}
                                </div>
                            </div>
                        )}

                        {/*<span><a href={embed.url} target={"_blank"} className={styles.author}>Author</a></span>*/}
                        {embed.title && (
                            <span>
                                <a
                                    href={embed.url}
                                    target={"_blank"}
                                    className={styles.title}
                                    rel="noreferrer">
                                    {embed.title}
                                </a>
                            </span>
                        )}
                        {embed.description && (
                            <div className={styles.description}>
                                {embed.description}
                            </div>
                        )}

                        {largeMedia && (
                            <EmbedMedia embed={embed} height={height} />
                        )}
                    </div>
                    {!largeMedia && (
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
                    onClick={() => openScreen({ id: "image_viewer", embed })}
                    onMouseDown={(ev) =>
                        ev.button === 1 && window.open(embed.url, "_blank")
                    }
                />
            );
        }
        default:
            return null;
    }
}
