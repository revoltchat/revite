import {
    Download,
    LinkExternal,
    File,
    Headphone,
    Video,
} from "@styled-icons/boxicons-regular";
import { Attachment } from "revolt.js/dist/api/objects";

import styles from "./Attachment.module.scss";
import classNames from "classnames";
import { useContext } from "preact/hooks";

import { determineFileSize } from "../../../../lib/fileSize";

import { AppContext } from "../../../../context/revoltjs/RevoltClient";

import IconButton from "../../../ui/IconButton";

interface Props {
    attachment: Attachment;
}

export default function AttachmentActions({ attachment }: Props) {
    const client = useContext(AppContext);
    const { filename, metadata, size } = attachment;

    const url = client.generateFileURL(attachment)!;
    const open_url = `${url}/${filename}`;
    const download_url = url.replace("attachments", "attachments/download");

    const filesize = determineFileSize(size);

    switch (metadata.type) {
        case "Image":
            return (
                <div className={classNames(styles.actions, styles.imageAction)}>
                    <span className={styles.filename}>{filename}</span>
                    <span className={styles.filesize}>
                        {metadata.width + "x" + metadata.height} ({filesize})
                    </span>
                    <a
                        href={open_url}
                        target="_blank"
                        className={styles.iconType}>
                        <IconButton>
                            <LinkExternal size={24} />
                        </IconButton>
                    </a>
                    <a
                        href={download_url}
                        className={styles.downloadIcon}
                        download
                        target="_blank">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </a>
                </div>
            );
        case "Audio":
            return (
                <div className={classNames(styles.actions, styles.audioAction)}>
                    <Headphone size={24} className={styles.iconType} />
                    <span className={styles.filename}>{filename}</span>
                    <span className={styles.filesize}>{filesize}</span>
                    <a
                        href={download_url}
                        className={styles.downloadIcon}
                        download
                        target="_blank">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </a>
                </div>
            );
        case "Video":
            return (
                <div className={classNames(styles.actions, styles.videoAction)}>
                    <Video size={24} className={styles.iconType} />
                    <span className={styles.filename}>{filename}</span>
                    <span className={styles.filesize}>
                        {metadata.width + "x" + metadata.height} ({filesize})
                    </span>
                    <a
                        href={download_url}
                        className={styles.downloadIcon}
                        download
                        target="_blank">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </a>
                </div>
            );
        default:
            return (
                <div className={styles.actions}>
                    <File size={24} className={styles.iconType} />
                    <span className={styles.filename}>{filename}</span>
                    <span className={styles.filesize}>{filesize}</span>
                    <a
                        href={download_url}
                        className={styles.downloadIcon}
                        download
                        target="_blank">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </a>
                </div>
            );
    }
}
