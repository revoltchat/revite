import { DownArrow } from "@styled-icons/boxicons-regular";
import styled from "styled-components";

import { Text } from "preact-i18n";

import {
	SingletonMessageRenderer,
	useRenderState,
} from "../../../../lib/renderer/Singleton";

const Bar = styled.div`
	z-index: 10;
	position: relative;

	> div {
		top: -26px;
		width: 100%;
		position: absolute;
		border-radius: 4px 4px 0 0;
		display: flex;
		cursor: pointer;
		font-size: 13px;
		padding: 4px 8px;
		user-select: none;
		color: var(--secondary-foreground);
		background: var(--secondary-background);
		justify-content: space-between;
		transition: color ease-in-out 0.08s;

		> div {
			display: flex;
			align-items: center;
			gap: 6px;
		}

		&:hover {
			color: var(--primary-text);
		}

		&:active {
			transform: translateY(1px);
		}
	}
`;

export default function JumpToBottom({ id }: { id: string }) {
	const view = useRenderState(id);
	if (!view || view.type !== "RENDER" || view.atBottom) return null;

	return (
		<Bar>
			<div
				onClick={() => SingletonMessageRenderer.jumpToBottom(id, true)}>
				<div>
					<Text id="app.main.channel.misc.viewing_old" />
				</div>
				<div>
					<Text id="app.main.channel.misc.jump_present" />{" "}
					<DownArrow size={18} />
				</div>
			</div>
		</Bar>
	);
}
