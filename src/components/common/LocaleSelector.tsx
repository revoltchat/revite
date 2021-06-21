import ComboBox from "../ui/ComboBox";
import { connectState } from "../../redux/connector";
import { WithDispatcher } from "../../redux/reducers";
import { LanguageEntry, Languages } from "../../context/Locale";

type Props = WithDispatcher & {
    locale: string;
};

export function LocaleSelector(props: Props) {
    return (
        <ComboBox
            value={props.locale}
            onChange={e =>
                props.dispatcher &&
                props.dispatcher({
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
    },
    true
);
