import { ComboBox } from "@revoltchat/ui";

import { useApplicationState } from "../../mobx/State";

import { Language, Languages } from "../../../external/lang/Languages";

/**
 * Component providing a language selector combobox.
 * Note: this is not an observer but this is fine as we are just using a combobox.
 */
export default function LocaleSelector() {
    const locale = useApplicationState().locale;

    return (
        <ComboBox
            value={locale.getLanguage()}
            onChange={(e) =>
                locale.setLanguage(e.currentTarget.value as Language)
            }>
            {Object.keys(Languages).map((x) => {
                const l = Languages[x as keyof typeof Languages];
                return (
                    <option value={x} key={x}>
                        {l.emoji} {l.display}
                    </option>
                );
            })}
        </ComboBox>
    );
}
