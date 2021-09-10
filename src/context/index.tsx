import { BrowserRouter as Router } from "react-router-dom";

import State from "../redux/State";

import { Children } from "../types/Preact";
import Locale from "./Locale";
import Settings from "./Settings";
import Theme from "./Theme";
import Intermediate from "./intermediate/Intermediate";
import Client from "./revoltjs/RevoltClient";

export default function Context({ children }: { children: Children }) {
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <State>
                <Theme>
                    <Settings>
                        <Locale>
                            <Intermediate>
                                <Client>{children}</Client>
                            </Intermediate>
                        </Locale>
                    </Settings>
                </Theme>
            </State>
        </Router>
    );
}
