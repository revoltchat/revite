import {
	At,
	Reply as ReplyIcon,
	File,
	XCircle,
} from "@styled-icons/boxicons-regular";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { StateUpdater, useEffect } from "preact/hooks";

import { internalSubscribe } from "../../../../lib/eventEmitter";
import { useRenderState } from "../../../../lib/renderer/Singleton";

import { Reply } from "../../../../redux/reducers/queue";

import { useUsers } from "../../../../context/revoltjs/hooks";

import IconButton from "../../../ui/IconButton";

import Markdown from "../../../markdown/Markdown";
import UserShort from "../../user/UserShort";
import { ReplyBase } from "../attachments/MessageReply";

interface Props {
	channel: string;
	replies: Reply[];
	setReplies: StateUpdater<Reply[]>;
}

const Base = styled.div`
	display: flex;
	padding: 0 22px;
	user-select: none;
	align-items: center;
	background: var(--message-box);

	div {
		flex-grow: 1;
	}

	.actions {
		gap: 12px;
		display: flex;
	}

	.toggle {
		gap: 4px;
		display: flex;
		font-size: 0.7em;
		align-items: center;
	}
`;

// ! FIXME: Move to global config
const MAX_REPLIES = 5;
export default function ReplyBar({ channel, replies, setReplies }: Props) {
	useEffect(() => {
		return internalSubscribe(
			"ReplyBar",
			"add",
			(id) =>
				replies.length < MAX_REPLIES &&
				!replies.find((x) => x.id === id) &&
				setReplies([...replies, { id, mention: false }]),
		);
	}, [replies]);

	const view = useRenderState(channel);
	if (view?.type !== "RENDER") return null;

	const ids = replies.map((x) => x.id);
	const messages = view.messages.filter((x) => ids.includes(x._id));
	const users = useUsers(messages.map((x) => x.author));

	return (
		<div>
			{replies.map((reply, index) => {
				let message = messages.find((x) => reply.id === x._id);
				// ! FIXME: better solution would be to
				// ! have a hook for resolving messages from
				// ! render state along with relevant users
				// -> which then fetches any unknown messages
				if (!message)
					return (
						<span>
							<Text id="app.main.channel.misc.failed_load" />
						</span>
					);

				let user = users.find((x) => message!.author === x?._id);
				if (!user) return;

				return (
					<Base key={reply.id}>
						<ReplyBase preview>
							<ReplyIcon size={22} />
							<UserShort user={user} size={16} />
							{message.attachments &&
								message.attachments.length > 0 && (
									<File size={16} />
								)}
							<Markdown
								disallowBigEmoji
								content={(message.content as string).replace(
									/\n/g,
									" ",
								)}
							/>
						</ReplyBase>
						<span class="actions">
							<IconButton
								onClick={() =>
									setReplies(
										replies.map((_, i) =>
											i === index
												? { ..._, mention: !_.mention }
												: _,
										),
									)
								}>
								<span class="toggle">
									<At size={16} />{" "}
									{reply.mention ? "ON" : "OFF"}
								</span>
							</IconButton>
							<IconButton
								onClick={() =>
									setReplies(
										replies.filter((_, i) => i !== index),
									)
								}>
								<XCircle size={16} />
							</IconButton>
						</span>
					</Base>
				);
			})}
		</div>
	);
}
