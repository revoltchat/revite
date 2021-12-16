import { BrowserRouter as Router } from "react-router-dom";

import State from "../redux/State";

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
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <State>
                <Locale>
                    <Intermediate>
                        <Client>{children}</Client>
                    </Intermediate>
                </Locale>
                <Theme />
            </State>
        </Router>
    );
}
