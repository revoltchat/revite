import { Error, Check } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useMemo } from "preact/hooks";

import { Checkbox, LineDivider, Tip } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

import britannyFlagSVG from "../assets/flags/brittany.svg";
import enchantingTableWEBP from "../assets/flags/enchanting_table.webp";
import esperantoFlagSVG from "../assets/flags/esperanto.svg";
import kurdistanFlagSVG from "../assets/flags/kurdistan.svg";
import tamilFlagPNG from "../assets/flags/tamil_nadu.png";
import tokiponaSVG from "../assets/flags/toki_pona.svg";
import venetoFlagSVG from "../assets/flags/veneto.svg";

import {
    Language,
    LanguageEntry,
    Languages as Langs,
} from "../../../../external/lang/Languages";
import Emoji from "../../../components/common/Emoji";

type Key = [Language, LanguageEntry];

interface Props {
    entry: Key;
    selected: boolean;
    onSelect: () => void;
}

/**
 * Component providing individual language entries.
 * @param param0 Entry data
 */
function Entry({ entry: [x, lang], selected, onSelect }: Props) {
    return (
        <Checkbox
            key={x}
            className={styles.entry}
            value={selected}
            onChange={onSelect}
            title={
                <>
                    <div className={styles.flag}>
                        {lang.i18n === "vec" ? (
                            <img
                                src={venetoFlagSVG}
                                width={42}
                                loading="lazy"
                                style={{
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                }}
                            />
                        ) : lang.i18n === "br" ? (
                            <img
                                src={britannyFlagSVG}
                                width={42}
                                loading="lazy"
                                style={{
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                }}
                            />
                        ) : lang.i18n === "ckb" ? (
                            <img
                                src={kurdistanFlagSVG}
                                width={42}
                                loading="lazy"
                                style={{
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                }}
                            />
                        ) : lang.i18n === "eo" ? (
                            <img
                                src={esperantoFlagSVG}
                                width={42}
                                loading="lazy"
                                style={{
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                }}
                            />
                        ) : lang.i18n === "ta" ? (
                            <img
                                src={tamilFlagPNG}
                                width={42}
                                loading="lazy"
                                style={{ objectFit: "cover" }}
                            />
                        ) : lang.emoji === "🙂" ? (
                            <img
                                src={tokiponaSVG}
                                width={42}
                                loading="lazy"
                                style={{ borderRadius: "6px" }}
                            />
                        ) : lang.emoji === "🪄" ? (
                            <img
                                src={enchantingTableWEBP}
                                width={42}
                                loading="lazy"
                                style={{ objectFit: "contain" }}
                            />
                        ) : (
                            <Emoji size={42} emoji={lang.emoji} />
                        )}
                    </div>
                    <span className={styles.description}>
                        {lang.display} {lang.verified && <Check size={16} />}{" "}
                        {lang.incomplete && <Error size={16} />}
                    </span>
                </>
            }
        />
    );
}

/**
 * Component providing the language selection menu.
 */
export const Languages = observer(() => {
    const locale = useApplicationState().locale;
    const language = locale.getLanguage();

    // Generate languages array.
    const languages = useMemo(() => {
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

        return languages;
    }, []);

    // Creates entries with given key.
    const EntryFactory = ([x, lang]: Key) => (
        <Entry
            key={x}
            entry={[x, lang]}
            selected={language === x}
            onSelect={() => locale.setLanguage(x)}
        />
    );

    return (
        <div className={styles.languages}>
            <h3>
                <Text id="app.settings.pages.language.select" />
            </h3>
            <div className={styles.list}>
                {languages.filter(([, lang]) => !lang.cat).map(EntryFactory)}
            </div>
            <h3>
                <Text id="app.settings.pages.language.const" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => lang.cat === "const")
                    .map(EntryFactory)}
            </div>
            <h3>
                <Text id="app.settings.pages.language.other" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => lang.cat === "alt")
                    .map(EntryFactory)}
            </div>
            <LineDivider />
            <Tip>
                <span>
                    <Text id="app.settings.tips.languages.a" />{" "}
                    <a
                        href="https://weblate.insrt.uk/engage/revolt/?utm_source=widget"
                        target="_blank"
                        rel="noreferrer">
                        <Text id="app.settings.tips.languages.b" />
                    </a>
                </span>
            </Tip>
        </div>
    );
});
