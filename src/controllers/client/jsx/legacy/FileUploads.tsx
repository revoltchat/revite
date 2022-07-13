import { Plus } from "@styled-icons/boxicons-regular";
import { Pencil } from "@styled-icons/boxicons-solid";
import Axios, { AxiosRequestConfig } from "axios";

import styles from "./FileUploads.module.scss";
import classNames from "classnames";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { IconButton, Preloader } from "@revoltchat/ui";

import { determineFileSize } from "../../../../lib/fileSize";

import { modalController } from "../../../modals/ModalController";
import { useClient } from "../../ClientController";
import { takeError } from "../error";

type BehaviourType =
    | { behaviour: "ask"; onChange: (file: File) => void }
    | {
          behaviour: "upload";
          onUpload: (id: string) => Promise<void>;
          previewAfterUpload?: boolean;
      }
    | {
          behaviour: "multi";
          onChange: (files: File[]) => void;
          append?: (files: File[]) => void;
      };

type StyleType =
    | {
          style: "icon" | "banner";
          width?: number;
          height?: number;
          previewURL?: string;
          defaultPreview?: string;
          desaturateDefault?: boolean;
      }
    | {
          style: "attachment";
          attached: boolean;
          uploading: boolean;
          cancel: () => void;
          size?: number;
      };

type Props = BehaviourType &
    StyleType & {
        fileType:
            | "backgrounds"
            | "icons"
            | "avatars"
            | "attachments"
            | "banners"
            | "emojis";
        maxFileSize: number;
        remove: () => Promise<void>;
    };

export async function uploadFile(
    autumnURL: string,
    tag: string,
    file: File,
    config?: AxiosRequestConfig,
) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await Axios.post(`${autumnURL}/${tag}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        ...config,
    });

    return res.data.id;
}

let input: HTMLInputElement;
export function grabFiles(
    maxFileSize: number,
    cb: (files: File[]) => void,
    tooLarge: () => void,
    multiple?: boolean,
) {
    if (input) {
        input.remove();
    }

    input = document.createElement("input");

    input.accept = "*";
    input.type = "file";
    input.multiple = multiple ?? false;
    input.style.display = "none";

    input.addEventListener("change", async (e) => {
        const files = (e.currentTarget as HTMLInputElement)?.files;
        if (!files) return;

        for (const file of files) {
            if (file.size > maxFileSize) {
                return tooLarge();
            }
        }

        cb(Array.from(files));
    });

    // iOS requires us to append the file input
    // to DOM to allow us to add any images
    document.body.appendChild(input);
    input.click();
}

export function FileUploader(props: Props) {
    const { fileType, maxFileSize, remove } = props;
    const client = useClient();

    const [uploading, setUploading] = useState(false);
    const [previewFile, setPreviewFile] = useState<File>(null!);
    const [generatedPreviewURL, setGeneratedPreviewURL] = useState<
        string | undefined
    >(undefined);
    useEffect(() => {
        if (previewFile) {
            const url: string = URL.createObjectURL(previewFile);
            setGeneratedPreviewURL(url);
            return () => URL.revokeObjectURL(url);
        }

        setGeneratedPreviewURL("");
    }, [previewFile]);

    function onClick() {
        if (uploading) return;

        grabFiles(
            maxFileSize,
            async (files) => {
                setUploading(true);

                try {
                    if (props.behaviour === "multi") {
                        props.onChange(files);
                    } else if (props.behaviour === "ask") {
                        props.onChange(files[0]);
                    } else {
                        await props.onUpload(
                            await uploadFile(
                                client.configuration!.features.autumn.url,
                                fileType,
                                files[0],
                            ),
                        );

                        if (props.previewAfterUpload) {
                            setPreviewFile(files[0]);
                        }
                    }
                } catch (err) {
                    return modalController.push({
                        type: "error",
                        error: takeError(err),
                    });
                } finally {
                    setUploading(false);
                }
            },
            () =>
                modalController.push({
                    type: "error",
                    error: "FileTooLarge",
                }),
            props.behaviour === "multi",
        );
    }

    function removeOrUpload() {
        if (uploading) return;

        if (props.style === "attachment") {
            if (props.attached) {
                props.remove();
            } else {
                onClick();
            }
        } else if (props.previewURL || previewFile) {
            if (previewFile) {
                setPreviewFile(null!);
            }

            props.remove();
        } else {
            onClick();
        }
    }

    if (props.behaviour === "multi" && props.append) {
        // eslint-disable-next-line
        useEffect(() => {
            // File pasting.
            function paste(e: ClipboardEvent) {
                const items = e.clipboardData?.items;
                if (typeof items === "undefined") return;
                if (props.behaviour !== "multi" || !props.append) return;

                const files = [];
                for (const item of items) {
                    if (!item.type.startsWith("text/")) {
                        const blob = item.getAsFile();
                        if (blob) {
                            if (blob.size > props.maxFileSize) {
                                modalController.push({
                                    type: "error",
                                    error: "FileTooLarge",
                                });
                                continue;
                            }

                            files.push(blob);
                        }
                    }
                }

                props.append(files);
            }

            // Let the browser know we can drop files.
            function dragover(e: DragEvent) {
                e.stopPropagation();
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
            }

            // File dropping.
            function drop(e: DragEvent) {
                e.preventDefault();
                if (props.behaviour !== "multi" || !props.append) return;

                const dropped = e.dataTransfer?.files;
                if (dropped) {
                    const files = [];
                    for (const item of dropped) {
                        if (item.size > props.maxFileSize) {
                            modalController.push({
                                type: "error",
                                error: "FileTooLarge",
                            });
                            continue;
                        }

                        files.push(item);
                    }

                    props.append(files);
                }
            }

            document.addEventListener("paste", paste);
            document.addEventListener("dragover", dragover);
            document.addEventListener("drop", drop);

            return () => {
                document.removeEventListener("paste", paste);
                document.removeEventListener("dragover", dragover);
                document.removeEventListener("drop", drop);
            };
        }, [props, props.append]);
    }

    if (props.style === "icon" || props.style === "banner") {
        const { style, previewURL, defaultPreview, width, height } = props;
        return (
            <div
                className={classNames(styles.uploader, {
                    [styles.icon]: style === "icon",
                    [styles.banner]: style === "banner",
                })}
                style={{
                    alignItems: props.style === "icon" ? "center" : "none",
                }}
                data-uploading={uploading}>
                <div
                    className={classNames(
                        styles.image,
                        props.desaturateDefault &&
                            previewURL == null &&
                            styles.desaturate,
                    )}
                    style={{
                        backgroundImage:
                            style === "icon"
                                ? `url('${
                                      generatedPreviewURL ||
                                      previewURL ||
                                      defaultPreview
                                  }')`
                                : previewURL
                                ? `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('${previewURL}')`
                                : "none",
                        width,
                        height,
                    }}
                    onClick={onClick}>
                    {uploading ? (
                        <div className={styles.uploading}>
                            <Preloader type="ring" />
                        </div>
                    ) : (
                        <div className={styles.edit}>
                            <Pencil size={30} />
                        </div>
                    )}
                </div>
                <div className={styles.modify}>
                    <span onClick={removeOrUpload}>
                        {uploading ? (
                            <Text id="app.main.channel.uploading_file" />
                        ) : props.previewURL || previewFile ? (
                            <Text id="app.settings.actions.remove" />
                        ) : (
                            <Text id="app.settings.actions.upload" />
                        )}
                    </span>
                    <span className={styles.small}>
                        <Text
                            id="app.settings.actions.max_filesize"
                            fields={{
                                filesize: determineFileSize(maxFileSize),
                            }}
                        />
                    </span>
                </div>
            </div>
        );
    } else if (props.style === "attachment") {
        const { attached, uploading, cancel, size } = props;
        return (
            <IconButton
                onClick={() => {
                    if (uploading) return cancel();
                    if (attached) return remove();
                    onClick();
                }}
                rotate={uploading || attached ? "45deg" : undefined}>
                <Plus size={size} />
            </IconButton>
        );
    }

    return null;
}
