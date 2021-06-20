import styles from './Embed.module.scss';
import IconButton from '../../../ui/IconButton';
import { ExternalLink } from '@styled-icons/feather';
import { EmbedImage } from "revolt.js/dist/api/objects";

interface Props {
    embed: EmbedImage;
}

export default function EmbedMediaActions({ embed }: Props) {
    const filename = embed.url.split('/').pop();

    return (
        <div className={styles.actions}>
            <div className={styles.info}>
                <span className={styles.filename}>{filename}</span>
                <span className={styles.filesize}>{embed.width + 'x' + embed.height}</span>
            </div>
            <a href={embed.url} target="_blank">
                <IconButton>
                    <ExternalLink size={24} />
                </IconButton>
            </a>
        </div>
    )
}
