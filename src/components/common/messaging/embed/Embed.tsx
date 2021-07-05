import { Embed as EmbedRJS } from "revolt.js/dist/api/objects";

import styles from "./Embed.module.scss";
import classNames from "classnames";
import { useContext } from "preact/hooks";

import { useIntermediate } from "../../../../context/intermediate/Intermediate";

import { MessageAreaWidthContext } from "../../../../pages/channels/messaging/MessageArea";
import EmbedMedia from "./EmbedMedia";

interface Props {
	embed: EmbedRJS;
}

const MAX_EMBED_WIDTH = 480;
const MAX_EMBED_HEIGHT = 640;
const CONTAINER_PADDING = 24;
const MAX_PREVIEW_SIZE = 150;

export default function Embed({ embed }: Props) {
	// ! FIXME: temp code
	// ! add proxy function to client
	function proxyImage(url: string) {
		return "https://jan.revolt.chat/proxy?url=" + encodeURIComponent(url);
	}

	const { openScreen } = useIntermediate();
	const maxWidth = Math.min(
		useContext(MessageAreaWidthContext) - CONTAINER_PADDING,
		MAX_EMBED_WIDTH,
	);

	function calculateSize(
		w: number,
		h: number,
	): { width: number; height: number } {
		let limitingWidth = Math.min(maxWidth, w);

		let limitingHeight = Math.min(MAX_EMBED_HEIGHT, h);

		// Calculate smallest possible WxH.
		let width = Math.min(limitingWidth, limitingHeight * (w / h));

		let height = Math.min(limitingHeight, limitingWidth * (h / w));

		return { width, height };
	}

	switch (embed.type) {
		case "Website": {
			// Determine special embed size.
			let mw, mh;
			let largeMedia =
				(embed.special && embed.special.type !== "None") ||
				embed.image?.size === "Large";
			switch (embed.special?.type) {
				case "YouTube":
				case "Bandcamp": {
					mw = embed.video?.width ?? 1280;
					mh = embed.video?.height ?? 720;
					break;
				}
				case "Twitch": {
					mw = 1280;
					mh = 720;
					break;
				}
				default: {
					if (embed.image?.size === "Preview") {
						mw = MAX_EMBED_WIDTH;
						mh = Math.min(
							embed.image.height ?? 0,
							MAX_PREVIEW_SIZE,
						);
					} else {
						mw = embed.image?.width ?? MAX_EMBED_WIDTH;
						mh = embed.image?.height ?? 0;
					}
				}
			}

			let { width, height } = calculateSize(mw, mh);
			return (
				<div
					className={classNames(styles.embed, styles.website)}
					style={{
						borderInlineStartColor:
							embed.color ?? "var(--tertiary-background)",
						width: width + CONTAINER_PADDING,
					}}>
					<div>
						{embed.site_name && (
							<div className={styles.siteinfo}>
								{embed.icon_url && (
									<img
										className={styles.favicon}
										src={proxyImage(embed.icon_url)}
										draggable={false}
										onError={(e) =>
											(e.currentTarget.style.display =
												"none")
										}
									/>
								)}
								<div className={styles.site}>
									{embed.site_name}{" "}
								</div>
							</div>
						)}

						{/*<span><a href={embed.url} target={"_blank"} className={styles.author}>Author</a></span>*/}
						{embed.title && (
							<span>
								<a
									href={embed.url}
									target={"_blank"}
									className={styles.title}>
									{embed.title}
								</a>
							</span>
						)}
						{embed.description && (
							<div className={styles.description}>
								{embed.description}
							</div>
						)}

						{largeMedia && (
							<EmbedMedia embed={embed} height={height} />
						)}
					</div>
					{!largeMedia && (
						<div>
							<EmbedMedia
								embed={embed}
								width={
									height *
									((embed.image?.width ?? 0) /
										(embed.image?.height ?? 0))
								}
								height={height}
							/>
						</div>
					)}
				</div>
			);
		}
		case "Image": {
			return (
				<img
					className={classNames(styles.embed, styles.image)}
					style={calculateSize(embed.width, embed.height)}
					src={proxyImage(embed.url)}
					type="text/html"
					frameBorder="0"
					onClick={() => openScreen({ id: "image_viewer", embed })}
					onMouseDown={(ev) =>
						ev.button === 1 && window.open(embed.url, "_blank")
					}
				/>
			);
		}
		default:
			return null;
	}
}
