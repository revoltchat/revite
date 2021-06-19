import { useState } from "preact/hooks";

const counts: { [key: string]: number } = {};

export default function PaintCounter({ small }: { small?: boolean }) {
    if (import.meta.env.PROD) return null;

    const [uniqueId] = useState('' + Math.random());
    const count = counts[uniqueId] ?? 0;
    counts[uniqueId] = count + 1;
    return (
        <span>
            { small ? <>P: { count + 1 }</> : <>
                Painted {count + 1} time(s).
            </> }
        </span>
    )
}
