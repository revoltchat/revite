import { Text } from "preact-i18n";
import styles from "./Panes.module.scss";
import { dispatch } from "../../../redux";
import Tip from "../../../components/ui/Tip";
import Emoji from "../../../components/common/Emoji";
import Checkbox from "../../../components/ui/Checkbox";
import { connectState } from "../../../redux/connector";
import { Language, LanguageEntry, Languages as Langs } from "../../../context/Locale";

type Props = {
    locale: Language;
}

type Key = [ string, LanguageEntry ];

function Entry({ entry: [ x, lang ], locale }: { entry: Key } & Props) {
    return (
        <Checkbox
            key={x}
            className={styles.entry}
            checked={locale === x}
            onChange={v => {
                if (v) {
                    dispatch({
                        type: "SET_LOCALE",
                        locale: x as Language
                    });
                }
            }}
        >
            <div className={styles.flag}><Emoji size={42} emoji={lang.emoji} /></div>
            <span className={styles.description}>
                {lang.display}
            </span>
        </Checkbox>
    );
}

export function Component(props: Props) {
    const languages = Object
        .keys(Langs)
        .map(x => [ x, Langs[x as keyof typeof Langs] ]) as Key[];

    return (
        <div className={styles.languages}>
            <h3>
                <Text id="app.settings.pages.language.select" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => !lang.alt)
                    .map(([x, lang]) => <Entry key={x} entry={[x, lang]} {...props} />)}
            </div>
            <h3>
                <Text id="app.settings.pages.language.other" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => lang.alt)
                    .map(([x, lang]) => <Entry key={x} entry={[x, lang]} {...props} />)}
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
    }
);
