import { IntlProvider } from "preact-i18n";
import definition from "../../external/lang/en.json";

interface Props {
    children: JSX.Element | JSX.Element[];
}

export default function Locale({ children }: Props) {
    return <IntlProvider definition={definition}>{children}</IntlProvider>;
}
