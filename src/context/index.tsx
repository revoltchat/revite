import { BrowserRouter as Router } from "react-router-dom";

import State from "../redux/State";

import MobXState from "../mobx/State";
import { Children } from "../types/Preact";
import Locale from "./Locale";
import Settings from "./Settings";
import Theme from "./Theme";
import Voice from "./Voice";
import Intermediate from "./intermediate/Intermediate";
import Client from "./revoltjs/RevoltClient";

export default function Context({ children }: { children: Children }) {
    return (
        <Router>
            <State>
                <MobXState>
                    <Theme>
                        <Settings>
                            <Locale>
                                <Intermediate>
                                    <Client>
                                        <Voice>{children}</Voice>
                                    </Client>
                                </Intermediate>
                            </Locale>
                        </Settings>
                    </Theme>
                </MobXState>
            </State>
        </Router>
    );
}
