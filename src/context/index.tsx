import State from "../redux/State";
import { Children } from "../types/Preact";
import { BrowserRouter } from "react-router-dom";

import Intermediate from './intermediate/Intermediate';
import ClientContext from './revoltjs/RevoltClient';
import Locale from "./Locale";
import Theme from "./Theme";

export default function Context({ children }: { children: Children }) {
    return (
        <State>
            <Locale>
                <Intermediate>
                    <BrowserRouter>
                        <ClientContext>
                            <Theme>{children}</Theme>
                        </ClientContext>
                    </BrowserRouter>
                </Intermediate>
            </Locale>
        </State>
    );
}
