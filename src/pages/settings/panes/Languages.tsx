import { Text } from "preact-i18n";
import styles from "./Panes.module.scss";
import Tip from "../../../components/ui/Tip";
import Emoji from "../../../components/common/Emoji";
import Checkbox from "../../../components/ui/Checkbox";
import { connectState } from "../../../redux/connector";
import { WithDispatcher } from "../../../redux/reducers";
import { Language, LanguageEntry, Languages as Langs } from "../../../context/Locale";

interface Props {
    locale: Language;
}

export function Component({ locale, dispatcher }: Props & WithDispatcher) {
    return (
        <div className={styles.languages}>
            <h3>
                <Text id="app.settings.pages.language.select" />
            </h3>
            <div className={styles.list}>
                {Object.keys(Langs).map(x => {
                    const l = (Langs as any)[x] as LanguageEntry;
                    return (
                        <Checkbox
                            key={x}
                            className={styles.entry}
                            checked={locale === x}
                            onChange={v => {
                                if (v) {
                                    dispatcher({
                                        type: "SET_LOCALE",
                                        locale: x as Language
                                    });
                                }
                            }}
                        >
                            <div className={styles.flag}><Emoji size={42} emoji={l.emoji} /></div>
                            <span className={styles.description}>
                                {l.display}
                            </span>
                        </Checkbox>
                    );
                })}
            </div>
            <Tip>
                <span>
                    <Text id="app.settings.tips.languages.a" />
                </span>{" "}
                <a
                    href="https://weblate.insrt.uk/engage/revolt/?utm_source=widget"
                    target="_blank"
                >
                    <Text id="app.settings.tips.languages.b" />
                </a>
            </Tip>
        </div>
    );
}

export const Languages = connectState(
    Component,
    state => {
        return {
            locale: state.locale
        };
    },
    true
);
