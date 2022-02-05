// leet.json generator
// deno run --allow-read --allow-write leet.ts

const REPLACEMENTS = {
    I: '1',
    R: '2',
    E: '3',
    A: '4',
    S: '5',
    G: '6',
    T: '7',
    B: '8',
    O: '0'
}

function encode(input: string) {
    return input.toUpperCase()
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
await Deno.writeTextFile("./leet.json", JSON.stringify(data));
