import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";

import {
    Language,
    LanguageEntry,
    Languages as Langs,
} from "../../../context/Locale";

import Emoji from "../../../components/common/Emoji";
import Checkbox from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";
import enchantingTableWEBP from "../assets/enchanting_table.webp";
import tamilFlagPNG from "../assets/tamil_nadu_flag.png";
import tokiponaSVG from "../assets/toki_pona.svg";

type Props = {
    locale: Language;
};

type Key = [string, LanguageEntry];

function Entry({ entry: [x, lang], locale }: { entry: Key } & Props) {
    return (
        <Checkbox
            key={x}
            className={styles.entry}
            checked={locale === x}
            onChange={(v) => {
                if (v) {
                    dispatch({
                        type: "SET_LOCALE",
                        locale: x as Language,
                    });
                }
            }}>
            <div className={styles.flag}>
                {lang.i18n === "ta" ? (
                    <img
                        src={tamilFlagPNG}
                        width={42}
                        style={{ objectFit: "contain" }}
                    />
                ) : lang.emoji === "🙂" ? (
                    <img src={tokiponaSVG} width={42} />
                ) : lang.emoji === "🪄" ? (
                    <img
                        src={enchantingTableWEBP}
                        width={42}
                        style={{ objectFit: "contain" }}
                    />
                ) : (
                    <Emoji size={42} emoji={lang.emoji} />
                )}
            </div>
            <span className={styles.description}>{lang.display}</span>
        </Checkbox>
    );
}

export function Component(props: Props) {
    const languages = Object.keys(Langs).map((x) => [
        x,
        Langs[x as keyof typeof Langs],
    ]) as Key[];

    // Get the user's system language. Check for exact
    // matches first, otherwise check for partial matches
    const preferredLanguage =
        navigator.languages.filter((lang) =>
            languages.find((l) => l[0].replace(/_/g, "-") == lang),
        )?.[0] ||
        navigator.languages
            ?.map((x) => x.split("-")[0])
            ?.filter((lang) => languages.find((l) => l[0] == lang))?.[0]
            ?.split("-")[0];

    if (preferredLanguage) {
        // This moves the user's system language to the top of the language list
        const prefLangKey = languages.find(
            (lang) => lang[0].replace(/_/g, "-") == preferredLanguage,
        );
        if (prefLangKey) {
            languages.splice(
                0,
                0,
                languages.splice(languages.indexOf(prefLangKey), 1)[0],
            );
        }
    }

    return (
        <div className={styles.languages}>
            <h3>
                <Text id="app.settings.pages.language.select" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => !lang.cat)
                    .map(([x, lang]) => (
                        <Entry key={x} entry={[x, lang]} {...props} />
                    ))}
            </div>
            <h3>
                <Text id="app.settings.pages.language.const" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => lang.cat === "const")
                    .map(([x, lang]) => (
                        <Entry key={x} entry={[x, lang]} {...props} />
                    ))}
            </div>
            <h3>
                <Text id="app.settings.pages.language.other" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => lang.cat === "alt")
                    .map(([x, lang]) => (
                        <Entry key={x} entry={[x, lang]} {...props} />
                    ))}
            </div>
            <Tip>
                <span>
                    <Text id="app.settings.tips.languages.a" />
                </span>{" "}
                <a
                    href="https://weblate.insrt.uk/engage/revolt/?utm_source=widget"
                    target="_blank"
                    rel="noreferrer">
                    <Text id="app.settings.tips.languages.b" />
                </a>
            </Tip>
        </div>
    );
}

export const Languages = connectState(Component, (state) => {
    return {
        locale: state.locale,
    };
});
