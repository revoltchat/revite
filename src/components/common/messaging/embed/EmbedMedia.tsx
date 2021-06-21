import styles from './Embed.module.scss';
import { Embed } from "revolt.js/dist/api/objects";
import { useIntermediate } from '../../../../context/intermediate/Intermediate';

interface Props {
    embed: Embed;
    width?: number;
    height: number;
}

export default function EmbedMedia({ embed, width, height }: Props) {
    // ! FIXME: temp code
    // ! add proxy function to client
    function proxyImage(url: string) {
        return 'https://jan.revolt.chat/proxy?url=' + encodeURIComponent(url);
    }

    if (embed.type !== 'Website') return null;
    const { openScreen } = useIntermediate();

    switch (embed.special?.type) {
        case 'YouTube': return (
            <iframe 
                src={`https://www.youtube-nocookie.com/embed/${embed.special.id}?modestbranding=1`}
                allowFullScreen
                style={{ height }} />
        )
        case 'Twitch': return (
            <iframe
                src={`https://player.twitch.tv/?${embed.special.content_type.toLowerCase()}=${embed.special.id}&parent=${window.location.hostname}&autoplay=false`}
                frameBorder="0"
                allowFullScreen
                scrolling="no"
                style={{ height, }} />
        )
        case 'Spotify': return (
            <iframe
                src={`https://open.spotify.com/embed/${embed.special.content_type}/${embed.special.id}`}
                frameBorder="0"
                allowFullScreen
                allowTransparency
                style={{ height }} />
        )
        case 'Soundcloud': return (
            <iframe
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(embed.url!)}&color=%23FF7F50&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                frameBorder="0"
                scrolling="no"
                style={{ height }} />
        )
        case 'Bandcamp': {
            return <iframe
                src={`https://bandcamp.com/EmbeddedPlayer/${embed.special.content_type.toLowerCase()}=${embed.special.id}/size=large/bgcol=181a1b/linkcol=056cc4/tracklist=false/transparent=true/`}
                seamless
                style={{ height }} />;
        }
        default: {
            if (embed.image) {
                let url = embed.image.url;
                return (
                    <img
                        className={styles.image}
                        src={proxyImage(url)}
                        style={{ width, height }}
                        onClick={() =>
                            openScreen({ id: "image_viewer", embed: embed.image })
                        }
                        onMouseDown={ev =>
                            ev.button === 1 &&
                            window.open(url, "_blank")
                        } />
                );
            }
        }
    }

    return null;
}
