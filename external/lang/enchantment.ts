// leet.json generator
// deno run --allow-read --allow-write enchantment.ts

const REPLACEMENTS = {
    "a": "ᔑ",
	"b": "ʖ",
	"c": "ᓵ",
	"d": "↸",
	"e": "ᒷ",
	"f": "⎓",
	"g": "⊣",
	"h": "⍑",
	"i": "╎",
	"j": "⋮",
	"k": "ꖌ",
	"l": "ꖎ",
	"m": "ᒲ",
	"n": "リ",
	"o": "𝙹",
	"p": "!¡",
	"q": "ᑑ",
	"r": "∷",
	"s": "ᓭ",
	"t": "ℸ",
	"u": "⚍",
	"v": "⍊",
	"w": "∴",
	"x": "/",
	"y": "||",
	"z": "⨅"
}

function encode(input: string) {
    return input.toLowerCase()
        .split('')
        .map(x => {
            // @ts-expect-error a
            if (REPLACEMENTS[x]) {
                // @ts-expect-error a
                return REPLACEMENTS[x]
            }

            return x;
        })
        .join('')
}

const text = await Deno.readTextFile("./en.json");
const data = JSON.parse(text);

function recurse(obj: { [key: string]: any }) {
    for (let key of Object.keys(obj)) {
        if (key === 'dayjs') return;
        if (typeof obj[key] === 'object') {
            recurse(obj[key]);
        } else {
            obj[key] = encode(obj[key]);
        }
    }
}

recurse(data);
await Deno.writeTextFile("./enchantment.json", JSON.stringify(data));
