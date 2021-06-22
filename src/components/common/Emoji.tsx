import { EmojiPacks } from '../../redux/reducers/settings';

var EMOJI_PACK = 'mutant';
const REVISION = 3;

export function setEmojiPack(pack: EmojiPacks) {
    EMOJI_PACK = pack;
}

// Originally taken from Twemoji source code,
// re-written by bree to be more readable.
function codePoints(rune: string) {
    const pairs = [];
    let low = 0;
    let i = 0;
    
    while (i < rune.length) {
        const charCode = rune.charCodeAt(i++);
        if (low) {
            pairs.push(0x10000 + ((low - 0xd800) << 10) + (charCode - 0xdc00));
            low = 0;
        } else if (0xd800 <= charCode && charCode <= 0xdbff) {
            low = charCode;
        } else {
            pairs.push(charCode);
        }
    }
    
    return pairs;
}

// Taken from Twemoji source code.
// scripts/build.js#344
// grabTheRightIcon(rawText);
const UFE0Fg = /\uFE0F/g;
const U200D = String.fromCharCode(0x200D);
function toCodePoint(rune: string) {
    return codePoints(rune.indexOf(U200D) < 0 ? rune.replace(UFE0Fg, '') : rune)
        .map((val) => val.toString(16))
        .join("-")
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
