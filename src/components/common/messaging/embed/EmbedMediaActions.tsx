import { LinkExternal } from "@styled-icons/boxicons-regular";
import { EmbedImage } from "revolt-api/types/January";

import styles from "./Embed.module.scss";

import IconButton from "../../../ui/IconButton";

interface Props {
    embed: EmbedImage;
}

export default function EmbedMediaActions({ embed }: Props) {
    const filename = embed.url.split("/").pop();

    return (
        <div className={styles.actions}>
            <span className={styles.filename}>{filename}</span>
            <span className={styles.filesize}>
                {`${embed.width}x${embed.height}`}
            </span>
            <a
                href={embed.url}
                class={styles.openIcon}
                target="_blank"
                rel="noreferrer">
                <IconButton>
                    <LinkExternal size={24} />
                </IconButton>
            </a>
        </div>
    );
}
