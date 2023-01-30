/* eslint-disable react-hooks/rules-of-hooks */
import { API } from "revolt.js";

import styles from "./Embed.module.scss";

import { useClient } from "../../../../controllers/client/ClientController";
import { modalController } from "../../../../controllers/modals/ModalController";

interface Props {
    embed: API.Embed;
    width?: number;
    height: number;
}

export default function EmbedMedia({ embed, width, height }: Props) {
    if (embed.type !== "Website") return null;
    const client = useClient();

    switch (embed.special?.type) {
        case "YouTube": {
            let timestamp = "";

            if (embed.special.timestamp) {
                timestamp = `&start=${embed.special.timestamp}`;
            }

            return (
                <iframe
                    loading="lazy"
                    src={`https://www.youtube-nocookie.com/embed/${embed.special.id}?modestbranding=1${timestamp}`}
                    allowFullScreen
                    style={{ height }}
                />
            );
        }
        case "Twitch":
            return (
                <iframe
                    src={`https://player.twitch.tv/?${embed.special.content_type.toLowerCase()}=${
                        embed.special.id
                    }&parent=${window.location.hostname}&autoplay=false`}
                    frameBorder="0"
                    allowFullScreen
                    scrolling="no"
                    loading="lazy"
                    style={{ height }}
                />
            );
        case "Lightspeed":
            return (
                <iframe
                    src={`https://new.lightspeed.tv/embed/${embed.special.id}/stream`}
                    frameBorder="0"
                    allowFullScreen
                    scrolling="no"
                    loading="lazy"
                    style={{ height }}
                />
            );
        case "Spotify":
            return (
                <iframe
                    src={`https://open.spotify.com/embed/${embed.special.content_type}/${embed.special.id}`}
                    loading="lazy"
                    frameBorder="0"
                    allowFullScreen
                    allowTransparency
                    style={{ height }}
                />
            );
        case "Soundcloud":
            return (
                <iframe
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                        embed.url!,
                    )}&color=%23FF7F50&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                    frameBorder="0"
                    scrolling="no"
                    loading="lazy"
                    style={{ height }}
                />
            );
        case "Bandcamp": {
            return (
                <iframe
                    src={`https://bandcamp.com/EmbeddedPlayer/${embed.special.content_type.toLowerCase()}=${
                        embed.special.id
                    }/size=large/bgcol=181a1b/linkcol=056cc4/tracklist=false/transparent=true/`}
                    seamless
                    loading="lazy"
                    style={{ height }}
                />
            );
        }
        case "Streamable": {
            return (
                <iframe
                    src={`https://streamable.com/e/${embed.special.id}?loop=0`}
                    seamless
                    loading="lazy"
                    style={{ height }}
                />
            );
        }
        default: {
            if (embed.video) {
                const url = embed.video.url;
                return (
                    <video
                        loading="lazy"
                        className={styles.image}
                        style={{ width, height }}
                        src={client.proxyFile(url)}
                        loop={embed.special?.type === "GIF"}
                        controls={embed.special?.type !== "GIF"}
                        autoPlay={embed.special?.type === "GIF"}
                        muted={embed.special?.type === "GIF" ? true : undefined}
                    />
                );
            } else if (embed.image) {
                const url = embed.image.url;
                return (
                    <img
                        className={styles.image}
                        src={client.proxyFile(url)}
                        loading="lazy"
                        style={{ width: "100%", height: "100%" }}
                        onClick={() =>
                            modalController.push({
                                type: "image_viewer",
                                embed: embed.image!,
                            })
                        }
                        onMouseDown={(ev) =>
                            ev.button === 1 && window.open(url, "_blank")
                        }
                    />
                );
            }
        }
    }

    return null;
}
