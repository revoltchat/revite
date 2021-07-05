import { useParams, useHistory } from "react-router-dom";
import { Channels } from "revolt.js/dist/api/objects";
import styled from "styled-components";

import { useState } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useChannel, useForceUpdate } from "../../context/revoltjs/hooks";

import MessageBox from "../../components/common/messaging/MessageBox";
import JumpToBottom from "../../components/common/messaging/bars/JumpToBottom";
import TypingIndicator from "../../components/common/messaging/bars/TypingIndicator";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";

import MemberSidebar from "../../components/navigation/right/MemberSidebar";
import ChannelHeader from "./ChannelHeader";
import { MessageArea } from "./messaging/MessageArea";
import VoiceHeader from "./voice/VoiceHeader";

const ChannelMain = styled.div`
	flex-grow: 1;
	display: flex;
	min-height: 0;
	overflow: hidden;
	flex-direction: row;
`;

const ChannelContent = styled.div`
	flex-grow: 1;
	display: flex;
	overflow: hidden;
	flex-direction: column;
`;

const AgeGate = styled.div`
	display: flex;
	flex-grow: 1;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	user-select: none;
	padding: 12px;

	img {
		height: 150px;
	}

	.subtext {
		color: var(--secondary-foreground);
		margin-bottom: 12px;
		font-size: 14px;
	}

	.actions {
		margin-top: 20px;
		display: flex;
		gap: 12px;
	}
`;

export function Channel({ id }: { id: string }) {
	const ctx = useForceUpdate();
	const channel = useChannel(id, ctx);

	if (!channel) return null;

	if (channel.channel_type === "VoiceChannel") {
		return <VoiceChannel channel={channel} />;
	} else {
		return <TextChannel channel={channel} />;
	}
}

function TextChannel({ channel }: { channel: Channels.Channel }) {
	const [showMembers, setMembers] = useState(true);

	if (
		(channel.channel_type === "TextChannel" ||
			channel.channel_type === "Group") &&
		channel.name.includes("nsfw")
	) {
		const goBack = useHistory();
		const [consent, setConsent] = useState(false);
		const [ageGate, setAgeGate] = useState(false);
		if (!ageGate) {
			return (
				<AgeGate>
					<img
						src={"https://static.revolt.chat/emoji/mutant/26a0.svg"}
						draggable={false}
					/>
					<h2>{channel.name}</h2>
					<span className="subtext">
						This channel is marked as NSFW.{" "}
						<a href="#">Learn more</a>
					</span>

					<Checkbox checked={consent} onChange={(v) => setConsent(v)}>
						I confirm that I am at least 18 years old.
					</Checkbox>
					<div className="actions">
						<Button contrast onClick={() => goBack}>
							Go back
						</Button>
						<Button
							contrast
							onClick={() => consent && setAgeGate(true)}>
							Enter Channel
						</Button>
					</div>
				</AgeGate>
			);
		}
	}

	let id = channel._id;
	return (
		<>
			<ChannelHeader
				channel={channel}
				toggleSidebar={() => setMembers(!showMembers)}
			/>
			<ChannelMain>
				<ChannelContent>
					<VoiceHeader id={id} />
					<MessageArea id={id} />
					<TypingIndicator id={id} />
					<JumpToBottom id={id} />
					<MessageBox channel={channel} />
				</ChannelContent>
				{!isTouchscreenDevice && showMembers && (
					<MemberSidebar channel={channel} />
				)}
			</ChannelMain>
		</>
	);
}

function VoiceChannel({ channel }: { channel: Channels.Channel }) {
	return (
		<>
			<ChannelHeader channel={channel} />
			<VoiceHeader id={channel._id} />
		</>
	);
}

export default function () {
	const { channel } = useParams<{ channel: string }>();
	return <Channel id={channel} key={channel} />;
}
