import State from "../redux/State";
import { Children } from "../types/Preact";
import { BrowserRouter } from "react-router-dom";

import Intermediate from './intermediate/Intermediate';
import ClientContext from './revoltjs/RevoltClient';
import Locale from "./Locale";
import Theme from "./Theme";

export default function Context({ children }: { children: Children }) {
    return (
        <BrowserRouter>
            <State>
                <Locale>
                    <Intermediate>
                        <ClientContext>
                            <Theme>{children}</Theme>
                        </ClientContext>
                    </Intermediate>
                </Locale>
            </State>
        </BrowserRouter>
    );
}
