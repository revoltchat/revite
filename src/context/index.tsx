import State from "../redux/State";
import { Children } from "../types/Preact";

import Locale from "./Locale";
import Theme from "./Theme";

export default function Context({ children }: { children: Children }) {
    return (
        <State>
            <Locale>
                <Theme>{children}</Theme>
            </Locale>
        </State>
    );
}
