import styled from "styled-components";

import { emojiDictionary } from "../../../assets/emojis";
import { clientController } from "../../../controllers/client/ClientController";
import { parseEmoji } from "../../common/Emoji";
import { createComponent, CustomComponentProps } from "./remarkRegexComponent";

const Emoji = styled.img`
    object-fit: contain;

    height: var(--emoji-size);
    width: var(--emoji-size);
    margin: 0 0.05em 0 0.1em;
    vertical-align: -0.2em;
`;

export function RenderEmoji({ match }: CustomComponentProps) {
    return (
        <Emoji
            alt={match}
            loading="lazy"
            className="emoji"
            draggable={false}
            src={parseEmoji(
                emojiDictionary[match as keyof typeof emojiDictionary],
            )}
        />
    );
}

const RE_EMOJI = /:([a-zA-Z0-9_]+):/g;

export const remarkEmoji = createComponent(
    "emoji",
    RE_EMOJI,
    (match) =>
        match in emojiDictionary ||
        clientController.getAvailableClient().emojis?.has(match),
);

export function isOnlyEmoji(text: string) {
    return text.replaceAll(RE_EMOJI, "").trim().length === 0;
}
