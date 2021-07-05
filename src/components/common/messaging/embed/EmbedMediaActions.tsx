import { LinkExternal } from "@styled-icons/boxicons-regular";
import { EmbedImage } from "revolt.js/dist/api/objects";

import styles from "./Embed.module.scss";

import IconButton from "../../../ui/IconButton";

interface Props {
    embed: EmbedImage;
}

export default function EmbedMediaActions({ embed }: Props) {
    const filename = embed.url.split("/").pop();

    return (
        <div className={styles.actions}>
            <div className={styles.info}>
                <span className={styles.filename}>{filename}</span>
                <span className={styles.filesize}>
                    {embed.width + "x" + embed.height}
                </span>
            </div>
            <a href={embed.url} target="_blank">
                <IconButton>
                    <LinkExternal size={24} />
                </IconButton>
            </a>
        </div>
    );
}
