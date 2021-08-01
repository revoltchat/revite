import { Download } from "@styled-icons/boxicons-regular";
import { CloudDownload } from "@styled-icons/boxicons-regular";

import { useContext, useEffect, useState } from "preact/hooks";

import { internalSubscribe } from "../../lib/eventEmitter";

import { ThemeContext } from "../../context/Theme";

import IconButton from "../ui/IconButton";

import { updateSW } from "../../main";

let pendingUpdate = false;
internalSubscribe("PWA", "update", () => (pendingUpdate = true));

interface Props {
    style: "titlebar" | "channel";
}

export default function UpdateIndicator({ style }: Props) {
    const [pending, setPending] = useState(pendingUpdate);

    useEffect(() => {
        return internalSubscribe("PWA", "update", () => setPending(true));
    });

    if (!pending) return null;
    const theme = useContext(ThemeContext);

    if (style === "titlebar") {
        return (
            <div onClick={() => updateSW(true)}>
                <CloudDownload size={22} color={theme.success} />
            </div>
        );
    }

    if (window.isNative) return null;

    return (
        <IconButton onClick={() => updateSW(true)}>
            <Download size={22} color={theme.success} />
        </IconButton>
    );
}
