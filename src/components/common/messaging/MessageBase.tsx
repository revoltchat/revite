import dayjs from "dayjs";
import styled, { css } from "styled-components";
import { decodeTime } from "ulid";

import { Text } from "preact-i18n";

import { MessageObject } from "../../../context/revoltjs/util";

import Tooltip from "../Tooltip";

export interface BaseMessageProps {
	head?: boolean;
	failed?: boolean;
	mention?: boolean;
	blocked?: boolean;
	sending?: boolean;
	contrast?: boolean;
}

export default styled.div<BaseMessageProps>`
	display: flex;
	overflow-x: none;
	padding: 0.125rem;
	flex-direction: row;
	padding-right: 16px;

	${(props) =>
		props.contrast &&
		css`
			padding: 0.3rem;
			border-radius: 4px;
			background: var(--hover);
		`}

	${(props) =>
		props.head &&
		css`
			margin-top: 12px;
		`}

    ${(props) =>
		props.mention &&
		css`
			background: var(--mention);
		`}

    ${(props) =>
		props.blocked &&
		css`
			filter: blur(4px);
			transition: 0.2s ease filter;

			&:hover {
				filter: none;
			}
		`}

    ${(props) =>
		props.sending &&
		css`
			opacity: 0.8;
			color: var(--tertiary-foreground);
		`}

    ${(props) =>
		props.failed &&
		css`
			color: var(--error);
		`}

    .detail {
		gap: 8px;
		display: flex;
		align-items: center;
	}

	.author {
		cursor: pointer;
		font-weight: 600 !important;

		&:hover {
			text-decoration: underline;
		}
	}

	.copy {
		display: block;
		overflow: hidden;
	}

	&:hover {
		background: var(--hover);

		time {
			opacity: 1;
		}
	}
`;

export const MessageInfo = styled.div`
	width: 62px;
	display: flex;
	flex-shrink: 0;
	padding-top: 2px;
	flex-direction: row;
	justify-content: center;

	.copyBracket {
		opacity: 0;
		position: absolute;
	}

	.copyTime {
		opacity: 0;
		position: absolute;
	}

	svg {
		user-select: none;
		cursor: pointer;

		&:active {
			transform: translateY(1px);
		}
	}

	time {
		opacity: 0;
	}

	time,
	.edited {
		margin-top: 1px;
		cursor: default;
		display: inline;
		font-size: 10px;
		color: var(--tertiary-foreground);
	}

	time,
	.edited > div {
		&::selection {
			background-color: transparent;
			color: var(--tertiary-foreground);
		}
	}
`;

export const MessageContent = styled.div`
	min-width: 0;
	flex-grow: 1;
	display: flex;
	// overflow: hidden;
	font-size: 0.875rem;
	flex-direction: column;
	justify-content: center;
`;

export const DetailBase = styled.div`
	gap: 4px;
	font-size: 10px;
	display: inline-flex;
	color: var(--tertiary-foreground);
`;

export function MessageDetail({
	message,
	position,
}: {
	message: MessageObject;
	position: "left" | "top";
}) {
	if (position === "left") {
		if (message.edited) {
			return (
				<>
					<time className="copyTime">
						<i className="copyBracket">[</i>
						{dayjs(decodeTime(message._id)).format("H:mm")}
						<i className="copyBracket">]</i>
					</time>
					<span className="edited">
						<Tooltip content={dayjs(message.edited).format("LLLL")}>
							<Text id="app.main.channel.edited" />
						</Tooltip>
					</span>
				</>
			);
		} else {
			return (
				<>
					<time>
						<i className="copyBracket">[</i>
						{dayjs(decodeTime(message._id)).format("H:mm")}
						<i className="copyBracket">]</i>
					</time>
				</>
			);
		}
	}

	return (
		<DetailBase>
			<time>{dayjs(decodeTime(message._id)).calendar()}</time>
			{message.edited && (
				<Tooltip content={dayjs(message.edited).format("LLLL")}>
					<Text id="app.main.channel.edited" />
				</Tooltip>
			)}
		</DetailBase>
	);
}
