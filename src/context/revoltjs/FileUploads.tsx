import { Plus, X, XCircle } from "@styled-icons/boxicons-regular";
import { Pencil } from "@styled-icons/boxicons-solid";
import Axios, { AxiosRequestConfig } from "axios";

import styles from "./FileUploads.module.scss";
import classNames from "classnames";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { determineFileSize } from "../../lib/fileSize";

import IconButton from "../../components/ui/IconButton";
import Preloader from "../../components/ui/Preloader";

import { useIntermediate } from "../intermediate/Intermediate";
import { AppContext } from "./RevoltClient";
import { takeError } from "./util";

type Props = {
	maxFileSize: number;
	remove: () => Promise<void>;
	fileType: "backgrounds" | "icons" | "avatars" | "attachments" | "banners";
} & (
	| { behaviour: "ask"; onChange: (file: File) => void }
	| { behaviour: "upload"; onUpload: (id: string) => Promise<void> }
	| {
			behaviour: "multi";
			onChange: (files: File[]) => void;
			append?: (files: File[]) => void;
	  }
) &
	(
		| {
				style: "icon" | "banner";
				defaultPreview?: string;
				previewURL?: string;
				width?: number;
				height?: number;
		  }
		| {
				style: "attachment";
				attached: boolean;
				uploading: boolean;
				cancel: () => void;
				size?: number;
		  }
	);

export async function uploadFile(
	autumnURL: string,
	tag: string,
	file: File,
	config?: AxiosRequestConfig,
) {
	const formData = new FormData();
	formData.append("file", file);

	const res = await Axios.post(autumnURL + "/" + tag, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
		...config,
	});

	return res.data.id;
}

export function grabFiles(
	maxFileSize: number,
	cb: (files: File[]) => void,
	tooLarge: () => void,
	multiple?: boolean,
) {
	const input = document.createElement("input");
	input.type = "file";
	input.multiple = multiple ?? false;

	input.onchange = async (e) => {
		const files = (e.currentTarget as HTMLInputElement)?.files;
		if (!files) return;
		for (let file of files) {
			if (file.size > maxFileSize) {
				return tooLarge();
			}
		}

		cb(Array.from(files));
	};

	input.click();
}

export function FileUploader(props: Props) {
	const { fileType, maxFileSize, remove } = props;
	const { openScreen } = useIntermediate();
	const client = useContext(AppContext);

	const [uploading, setUploading] = useState(false);

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
					}
				} catch (err) {
					return openScreen({ id: "error", error: takeError(err) });
				} finally {
					setUploading(false);
				}
			},
			() => openScreen({ id: "error", error: "FileTooLarge" }),
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
		} else {
			if (props.previewURL) {
				props.remove();
			} else {
				onClick();
			}
		}
	}

	if (props.behaviour === "multi" && props.append) {
		useEffect(() => {
			// File pasting.
			function paste(e: ClipboardEvent) {
				const items = e.clipboardData?.items;
				if (typeof items === "undefined") return;
				if (props.behaviour !== "multi" || !props.append) return;

				let files = [];
				for (const item of items) {
					if (!item.type.startsWith("text/")) {
						const blob = item.getAsFile();
						if (blob) {
							if (blob.size > props.maxFileSize) {
								openScreen({
									id: "error",
									error: "FileTooLarge",
								});
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
					let files = [];
					for (const item of dropped) {
						if (item.size > props.maxFileSize) {
							openScreen({ id: "error", error: "FileTooLarge" });
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
		}, [props.append]);
	}

	if (props.style === "icon" || props.style === "banner") {
		const { style, previewURL, defaultPreview, width, height } = props;
		return (
			<div
				className={classNames(styles.uploader, {
					[styles.icon]: style === "icon",
					[styles.banner]: style === "banner",
				})}
				data-uploading={uploading}>
				<div
					className={styles.image}
					style={{
						backgroundImage:
							style === "icon"
								? `url('${previewURL ?? defaultPreview}')`
								: previewURL
								? `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('${previewURL}')`
								: "black",
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
						) : props.previewURL ? (
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
				}}>
				{uploading ? (
					<XCircle size={size} />
				) : attached ? (
					<X size={size} />
				) : (
					<Plus size={size} />
				)}
			</IconButton>
		);
	}

	return null;
}
