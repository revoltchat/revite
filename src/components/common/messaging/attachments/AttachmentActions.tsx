import { useContext } from 'preact/hooks';
import styles from './Attachment.module.scss';
import IconButton from '../../../ui/IconButton';
import { Attachment } from "revolt.js/dist/api/objects";
import { AppContext } from '../../../../context/revoltjs/RevoltClient';
import { Download, ExternalLink, File, Headphones, Video } from '@styled-icons/feather';

interface Props {
    attachment: Attachment;
}

export function determineFileSize(size: number) {
    if (size > 1e6) {
        return `${(size / 1e6).toFixed(2)} MB`;
    } else if (size > 1e3) {
        return `${(size / 1e3).toFixed(2)} KB`;
    }

    return `${size} B`;
}

export default function AttachmentActions({ attachment }: Props) {
    const client = useContext(AppContext);
    const { filename, metadata, size } = attachment;

    const url = client.generateFileURL(attachment) as string;
    const open_url = `${url}/${filename}`;
    const download_url = url.replace('attachments', 'attachments/download')

    const filesize = determineFileSize(size as any);

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
                            <ExternalLink size={24} />
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
                    <Headphones size={24} strokeWidth={1.5} />
                    <div className={styles.info}>
                        <span className={styles.filename}>{filename}</span>
                        <span className={styles.filesize}>{filesize}</span>
                    </div>
                    <a href={download_url} download target="_blank">
                        <IconButton>
                            <Download size={24} strokeWidth={1.5} />
                        </IconButton>
                    </a>
                </div>
            )
        case 'Video':
            return (
                <div className={styles.actions}>
                    <Video size={24} strokeWidth={1.5} />
                    <div className={styles.info}>
                        <span className={styles.filename}>{filename}</span>
                        <span className={styles.filesize}>{metadata.width + 'x' + metadata.height} ({filesize})</span>
                    </div>
                    <a href={download_url} download target="_blank">
                        <IconButton>
                            <Download size={24} strokeWidth={1.5}/>
                        </IconButton>
                    </a>
                </div>
            )
        default:
            return (
                <div className={styles.actions}>
                    <File size={24} strokeWidth={1.5} />
                    <div className={styles.info}>
                        <span className={styles.filename}>{filename}</span>
                        <span className={styles.filesize}>{filesize}</span>
                    </div>
                    <a href={download_url} download target="_blank">
                        <IconButton>
                            <Download size={24} strokeWidth={1.5} />
                        </IconButton>
                    </a>
                </div>
            )
    }
}
