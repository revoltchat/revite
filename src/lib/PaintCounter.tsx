import { useState } from "preact/hooks";

const counts: { [key: string]: number } = {};

export default function PaintCounter() {
    const [uniqueId] = useState('' + Math.random());
    const count = counts[uniqueId] ?? 0;
    counts[uniqueId] = count + 1;
    return (
        <span>Painted {count + 1} time(s).</span>
    )
}
