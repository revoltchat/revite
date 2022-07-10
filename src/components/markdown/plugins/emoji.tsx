import styled from "styled-components";

import { useState } from "preact/hooks";

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

    img:before {
        content: " ";
        display: block;
        position: absolute;
        height: 50px;
        width: 50px;
        background-image: url(ishere.jpg);
    }
`;

export function RenderEmoji({ match }: CustomComponentProps) {
    const [fail, setFail] = useState(false);
    const url =
        match in emojiDictionary
            ? parseEmoji(emojiDictionary[match as keyof typeof emojiDictionary])
            : `${
                  clientController.getAvailableClient().configuration?.features
                      .autumn.url
              }/emojis/${match}`;

    if (fail) return <span>{`:${match}:`}</span>;

    return (
        <Emoji
            alt={`:${match}:`}
            loading="lazy"
            className="emoji"
            draggable={false}
            src={url}
            onError={() => setFail(true)}
        />
    );
}

const RE_EMOJI = /:([a-zA-Z0-9_+]+):/g;
const RE_ULID = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

export const remarkEmoji = createComponent(
    "emoji",
    RE_EMOJI,
    (match) => match in emojiDictionary || RE_ULID.test(match),
);

export function isOnlyEmoji(text: string) {
    return text.replaceAll(RE_EMOJI, "").trim().length === 0;
}
