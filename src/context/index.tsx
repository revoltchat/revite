import State from "../redux/State";
import { Children } from "../types/Preact";
import { BrowserRouter as Router } from "react-router-dom";

import Intermediate from './intermediate/Intermediate';
import Client from './revoltjs/RevoltClient';
import Voice from "./Voice";
import Locale from "./Locale";
import Theme from "./Theme";

export default function Context({ children }: { children: Children }) {
    return (
        <Router>
            <State>
                <Locale>
                    <Intermediate>
                        <Client>
                            <Voice>
                                <Theme>{children}</Theme>
                            </Voice>
                        </Client>
                    </Intermediate>
                </Locale>
            </State>
        </Router>
    );
}
