import { BrowserRouter as Router, Link } from "react-router-dom";

import { ContextMenuTrigger } from "preact-context-menu";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { Preloader, UIProvider } from "@revoltchat/ui";

import { hydrateState } from "../mobx/State";

import Locale from "./Locale";
import Theme from "./Theme";
import Intermediate from "./intermediate/Intermediate";
import ModalRenderer from "./modals/ModalRenderer";
import Client from "./revoltjs/RevoltClient";
import SyncManager from "./revoltjs/SyncManager";

const uiContext = {
    Link,
    Text: Text as any,
    Trigger: ContextMenuTrigger,
    emitAction: () => {},
};

/**
 * This component provides all of the application's context layers.
 * @param param0 Provided children
 */
export default function Context({ children }: { children: Children }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        hydrateState().then(() => setReady(true));
    }, []);

    if (!ready) return <Preloader type="spinner" />;

    return (
        <Router basename={import.meta.env.BASE_URL}>
            <UIProvider value={uiContext}>
                <Locale>
                    <Intermediate>
                        <Client>
                            {children}
                            <SyncManager />
                        </Client>
                    </Intermediate>
                    <ModalRenderer />
                </Locale>
            </UIProvider>
            <Theme />
        </Router>
    );
}
