import ComboBox from "../ui/ComboBox";
import { dispatch } from "../../redux";
import { connectState } from "../../redux/connector";
import { LanguageEntry, Languages } from "../../context/Locale";

type Props = {
    locale: string;
};

export function LocaleSelector(props: Props) {
    return (
        <ComboBox
            value={props.locale}
            onChange={e =>
                dispatch({
                    type: "SET_LOCALE",
                    locale: e.currentTarget.value as any
                })
            }
        >
            {Object.keys(Languages).map(x => {
                const l = (Languages as any)[x] as LanguageEntry;
                return (
                    <option value={x}>
                        {l.emoji} {l.display}
                    </option>
                );
            })}
        </ComboBox>
    );
}

export default connectState(
    LocaleSelector,
    state => {
        return {
            locale: state.locale
        };
    }
);
