/* eslint-disable react-hooks/rules-of-hooks */
import { Download, CloudDownload } from "@styled-icons/boxicons-regular";

import { useEffect, useState } from "preact/hooks";

import { internalSubscribe } from "../../lib/eventEmitter";

import { useApplicationState } from "../../mobx/State";

import IconButton from "../ui/IconButton";

import { updateSW } from "../../main";
import Tooltip from "./Tooltip";

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
    const theme = useApplicationState().settings.theme;

    if (style === "titlebar") {
        return (
            <div class="actions">
                <Tooltip
                    content="A new update is available!"
                    placement="bottom">
                    <div onClick={() => updateSW(true)}>
                        <CloudDownload
                            size={22}
                            color={theme.getVariable("success")}
                        />
                    </div>
                </Tooltip>
            </div>
        );
    }

    if (window.isNative) return null;

    return (
        <IconButton onClick={() => updateSW(true)}>
            <Download size={22} color={theme.getVariable("success")} />
        </IconButton>
    );
}
