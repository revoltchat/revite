import twemoji from 'twemoji';

var EMOJI_PACK = 'mutant';
const REVISION = 3;

/*export function setEmojiPack(pack: EmojiPacks) {
    EMOJI_PACK = pack;
}*/

// Taken from Twemoji source code.
// scripts/build.js#344
// grabTheRightIcon(rawText);
const UFE0Fg = /\uFE0F/g;
const U200D = String.fromCharCode(0x200D);
function toCodePoint(emoji: string) {
    return twemoji.convert.toCodePoint(emoji.indexOf(U200D) < 0 ?
        emoji.replace(UFE0Fg, '') :
        emoji
    );
}

function parseEmoji(emoji: string) {
    let codepoint = toCodePoint(emoji);
    return `https://static.revolt.chat/emoji/${EMOJI_PACK}/${codepoint}.svg?rev=${REVISION}`;
}

export default function Emoji({ emoji, size }: { emoji: string, size?: number }) {
    return (
        <img
            alt={emoji}
            className="emoji"
            draggable={false}
            src={parseEmoji(emoji)}
            style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
        />
    )
}

export function generateEmoji(emoji: string) {
    return `<img class="emoji" draggable="false" alt="${emoji}" src="${parseEmoji(emoji)}" />`;
}
