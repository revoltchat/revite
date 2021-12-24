import { BrowserRouter as Router } from "react-router-dom";

import { useEffect, useState } from "preact/hooks";

import { hydrateState } from "../mobx/State";

import Preloader from "../components/ui/Preloader";

import { Children } from "../types/Preact";
import Locale from "./Locale";
import Theme from "./Theme";
import Intermediate from "./intermediate/Intermediate";
import Client from "./revoltjs/RevoltClient";

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
            <Locale>
                <Intermediate>
                    <Client>{children}</Client>
                </Intermediate>
            </Locale>
            <Theme />
        </Router>
    );
}
