// bottom.json generator
// deno run --allow-read --allow-write bottomify.ts

import { encode } from "https://deno.land/x/bottomify@0.3.0/deno.ts";

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
await Deno.writeTextFile("./bottom.json", JSON.stringify(data));
