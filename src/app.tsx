import { Text } from "preact-i18n";
import Context from "./context";

import dayjs from "dayjs";

import localeData from 'dayjs/plugin/localeData';
dayjs.extend(localeData)

export function App() {
    return (
        <Context>
            <h1><Text id="general.about" /></h1>
            <h3>{ dayjs.locale() }</h3>
            <h2>{ dayjs.months() }</h2>
        </Context>
    );
}
