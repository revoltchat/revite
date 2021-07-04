import { useContext } from 'preact/hooks';
import styles from './Attachment.module.scss';
import IconButton from '../../../ui/IconButton';
import { Attachment } from "revolt.js/dist/api/objects";
import { determineFileSize } from '../../../../lib/fileSize';
import { AppContext } from '../../../../context/revoltjs/RevoltClient';
import { Download, LinkExternal, File, Headphone, Video } from '@styled-icons/boxicons-regular';

interface Props {
    attachment: Attachment;
}

export default function AttachmentActions({ attachment }: Props) {
    const client = useContext(AppContext);
    const { filename, metadata, size } = attachment;

    const url = client.generateFileURL(attachment)!;
    const open_url = `${url}/${filename}`;
    const download_url = url.replace('attachments', 'attachments/download')

    // for some reason revolt.js says the size is a string even though it's a number
    const filesize = determineFileSize(size as unknown as number);

    switch (metadata.type) {
        case 'Image':
            return (
                <div className={styles.actions}>
                    <div className={styles.info}>
                        <span className={styles.filename}>{filename}</span>
                        <span className={styles.filesize}>{metadata.width + 'x' + metadata.height} ({filesize})</span>
                    </div>
                    <a href={open_url} target="_blank">
                        <IconButton>
                            <LinkExternal size={24} />
                        </IconButton>
                    </a>
                    <a href={download_url} download target="_blank">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </a>
                </div>
            )
        case 'Audio':
            return (
                <div className={styles.actions}>
                    <Headphone size={24} />
                    <div className={styles.info}>
                        <span className={styles.filename}>{filename}</span>
                        <span className={styles.filesize}>{filesize}</span>
                    </div>
                    <a href={download_url} download target="_blank">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </a>
                </div>
            )
        case 'Video':
            return (
                <div className={styles.actions}>
                    <Video size={24} />
                    <div className={styles.info}>
                        <span className={styles.filename}>{filename}</span>
                        <span className={styles.filesize}>{metadata.width + 'x' + metadata.height} ({filesize})</span>
                    </div>
                    <a href={download_url} download target="_blank">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </a>
                </div>
            )
        default:
            return (
                <div className={styles.actions}>
                    <File size={24} />
                    <div className={styles.info}>
                        <span className={styles.filename}>{filename}</span>
                        <span className={styles.filesize}>{filesize}</span>
                    </div>
                    <a href={download_url} download target="_blank">
                        <IconButton>
                            <Download size={24} />
                        </IconButton>
                    </a>
                </div>
            )
    }
}
