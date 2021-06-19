// ! FIXME: also TEMP CODE
// ! RE-WRITE WITH STYLED-COMPONENTS

import { Text } from "preact-i18n";
import { takeError } from "./util";
import classNames from "classnames";
import styles from './FileUploads.module.scss';
import Axios, { AxiosRequestConfig } from "axios";
import { useContext, useState } from "preact/hooks";
import { Edit, Plus, X } from "@styled-icons/feather";
import Preloader from "../../components/ui/Preloader";
import { determineFileSize } from "../../lib/fileSize";
import IconButton from '../../components/ui/IconButton';
import { useIntermediate } from "../intermediate/Intermediate";
import { AppContext } from "./RevoltClient";

type Props = {
    maxFileSize: number
    remove: () => Promise<void>
    fileType: 'backgrounds' | 'icons' | 'avatars' | 'attachments' | 'banners'
} & (
    { behaviour: 'ask', onChange: (file: File) => void } |
    { behaviour: 'upload', onUpload: (id: string) => Promise<void> }
) & (
    { style: 'icon' | 'banner', defaultPreview?: string, previewURL?: string, width?: number, height?: number } |
    { style: 'attachment', attached: boolean, uploading: boolean, cancel: () => void, size?: number }
)

export async function uploadFile(autumnURL: string, tag: string, file: File, config?: AxiosRequestConfig) {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await Axios.post(autumnURL + "/" + tag, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        ...config
    });

    return res.data.id;
}

export function FileUploader(props: Props) {
    const { fileType, maxFileSize, remove } = props;
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);

    const [ uploading, setUploading ] = useState(false);

    function onClick() {
        if (uploading) return;

        const input = document.createElement("input");
        input.type = "file";

        input.onchange = async e => {
            setUploading(true);

            try {
                const files = (e.target as any)?.files;
                if (files && files[0]) {
                    let file = files[0];

                    if (file.size > maxFileSize) {
                        return openScreen({ id: "error", error: "FileTooLarge" });
                    }

                    if (props.behaviour === 'ask') {
                        await props.onChange(file);
                    } else {
                        await props.onUpload(await uploadFile(client.configuration!.features.autumn.url, fileType, file));
                    }
                }
            } catch (err) {
                return openScreen({ id: "error", error: takeError(err) });
            } finally {
                setUploading(false);
            }
        };

        input.click();
    }

    function removeOrUpload() {
        if (uploading) return;

        if (props.style === 'attachment') {
            if (props.attached) {
                props.remove();
            } else {
                onClick();
            }
        } else {
            if (props.previewURL) {
                props.remove();
            } else {
                onClick();
            }
        }
    }

    if (props.style === 'icon' || props.style === 'banner') {
        const { style, previewURL, defaultPreview, width, height } = props;
        return (
            <div className={classNames(styles.uploader,
                { [styles.icon]: style === 'icon',
                [styles.banner]: style === 'banner' })}
                data-uploading={uploading}>
                <div className={styles.image}
                    style={{ backgroundImage:
                        style === 'icon' ? `url('${previewURL ?? defaultPreview}')` :
                        (previewURL ? `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('${previewURL}')` : 'black'),
                        width, height
                    }}
                    onClick={onClick}>
                    { uploading ?
                        <div className={styles.uploading}>
                            <Preloader />
                        </div> :
                        <div className={styles.edit}>
                            <Edit size={30} />
                        </div> }
                </div>
                <div className={styles.modify}>
                    <span onClick={removeOrUpload}>{ 
                        uploading ? <Text id="app.main.channel.uploading_file" /> :
                        props.previewURL ? <Text id="app.settings.actions.remove" /> :
                        <Text id="app.settings.actions.upload" /> }</span>
                    <span className={styles.small}><Text id="app.settings.actions.max_filesize" fields={{ filesize: determineFileSize(maxFileSize) }} /></span>
                </div>
            </div>
        )
    } else if (props.style === 'attachment') {
        const { attached, uploading, cancel, size } = props;
        return (
            <IconButton
                onClick={() => {
                    if (uploading) return cancel();
                    if (attached) return remove();
                    onClick();
                }}>
                { attached ? <X size={size} /> : <Plus size={size} />}
            </IconButton>
        )
    }

    return null;
}
