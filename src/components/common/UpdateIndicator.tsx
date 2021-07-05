import { updateSW } from "../../main";
import IconButton from "../ui/IconButton";
import { ThemeContext } from "../../context/Theme";
import { Download } from "@styled-icons/boxicons-regular";
import { internalSubscribe } from "../../lib/eventEmitter";
import { useContext, useEffect, useState } from "preact/hooks";

var pendingUpdate = false;
internalSubscribe('PWA', 'update', () => pendingUpdate = true);

export default function UpdateIndicator() {
    const [ pending, setPending ] = useState(pendingUpdate);

    useEffect(() => {
        return internalSubscribe('PWA', 'update', () => setPending(true));
    });

    if (!pending) return null;
    const theme = useContext(ThemeContext);

    return (
        <IconButton onClick={() => updateSW(true)}>
            <Download size={22} color={theme.success} />
        </IconButton>
    )
}
