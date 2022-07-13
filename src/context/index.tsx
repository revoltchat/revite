import { Router, Link } from "react-router-dom";

import { ContextMenuTrigger } from "preact-context-menu";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { Preloader, UIProvider } from "@revoltchat/ui";

import { state } from "../mobx/State";

import Binder from "../controllers/client/jsx/Binder";
import ModalRenderer from "../controllers/modals/ModalRenderer";
import Locale from "./Locale";
import Theme from "./Theme";
import { history } from "./history";

const uiContext = {
    Link,
    Text: Text as any,
    Trigger: ContextMenuTrigger,
    emitAction: () => void {},
};

/**
 * This component provides all of the application's context layers.
 * @param param0 Provided children
 */
export default function Context({ children }: { children: Children }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        state.hydrate().then(() => setReady(true));
    }, []);

    if (!ready) return <Preloader type="spinner" />;

    return (
        <Router history={history}>
            <UIProvider value={uiContext}>
                <Locale>
                    <>{children}</>
                    <Binder />
                    <ModalRenderer />
                </Locale>
            </UIProvider>
            <Theme />
        </Router>
    );
}
