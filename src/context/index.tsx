import { BrowserRouter as Router, Link } from "react-router-dom";

import { ContextMenuTrigger } from "preact-context-menu";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import {
    LinkProvider,
    Preloader,
    TextProvider,
    TrigProvider,
} from "@revoltchat/ui";

import { hydrateState } from "../mobx/State";

import Locale from "./Locale";
import Theme from "./Theme";
import Intermediate from "./intermediate/Intermediate";
import Client from "./revoltjs/RevoltClient";
import SyncManager from "./revoltjs/SyncManager";

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
            <LinkProvider value={Link}>
                <TextProvider value={Text as any}>
                    <TrigProvider value={ContextMenuTrigger}>
                        <Locale>
                            <Intermediate>
                                <Client>
                                    {children}
                                    <SyncManager />
                                </Client>
                            </Intermediate>
                        </Locale>
                    </TrigProvider>
                </TextProvider>
            </LinkProvider>
            <Theme />
        </Router>
    );
}
