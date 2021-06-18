import State from "../redux/State";
import { Children } from "../types/Preact";
import { BrowserRouter } from "react-router-dom";

import ClientContext from './revoltjs/RevoltClient';
import Locale from "./Locale";
import Theme from "./Theme";

export default function Context({ children }: { children: Children }) {
    return (
        <BrowserRouter>
            <State>
                <ClientContext>
                    <Locale>
                        <Theme>{children}</Theme>
                    </Locale>
                </ClientContext>
            </State>
        </BrowserRouter>
    );
}
