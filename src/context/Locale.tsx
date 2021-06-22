import { IntlProvider } from "preact-i18n";
import { connectState } from "../redux/connector";
import { useEffect, useState } from "preact/hooks";
import definition from "../../external/lang/en.json";

import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import update from "dayjs/plugin/updateLocale";
import format from "dayjs/plugin/localizedFormat";
dayjs.extend(calendar);
dayjs.extend(format);
dayjs.extend(update);

export enum Language {
    ENGLISH = "en",

    ARABIC = "ar",
    AZERBAIJANI = "az",
    CZECH = "cs",
    GERMAN = "de",
    SPANISH = "es",
    FINNISH = "fi",
    FRENCH = "fr",
    HINDI = "hi",
    CROATIAN = "hr",
    HUNGARIAN = "hu",
    INDONESIAN = "id",
    LITHUANIAN = "lt",
    MACEDONIAN = "mk",
    DUTCH = "nl",
    POLISH = "pl",
    PORTUGUESE_BRAZIL = "pt_BR",
    ROMANIAN = "ro",
    RUSSIAN = "ru",
    SERBIAN = "sr",
    SWEDISH = "sv",
    TURKISH = "tr",
    UKRANIAN = "uk",
    CHINESE_SIMPLIFIED = "zh_Hans",

    OWO = "owo",
    PIRATE = "pr",
    BOTTOM = "bottom",
    PIGLATIN = "piglatin",
    HARDCORE = "hardcore",
}

export interface LanguageEntry {
    display: string;
    emoji: string;
    i18n: string;
    dayjs?: string;
    rtl?: boolean;
    alt?: boolean;
}

export const Languages: { [key in Language]: LanguageEntry } = {
    en: {
        display: "English (Traditional)",
        emoji: "🇬🇧",
        i18n: "en",
        dayjs: "en-gb",
    },

    ar: { display: "عربي", emoji: "🇸🇦", i18n: "ar", rtl: true },
    az: { display: "Azərbaycan dili", emoji: "🇦🇿", i18n: "az" },
    cs: { display: "Čeština", emoji: "🇨🇿", i18n: "cs" },
    de: { display: "Deutsch", emoji: "🇩🇪", i18n: "de" },
    es: { display: "Español", emoji: "🇪🇸", i18n: "es" },
    fi: { display: "suomi", emoji: "🇫🇮", i18n: "fi" },
    fr: { display: "Français", emoji: "🇫🇷", i18n: "fr" },
    hi: { display: "हिन्दी", emoji: "🇮🇳", i18n: "hi" },
    hr: { display: "Hrvatski", emoji: "🇭🇷", i18n: "hr" },
    hu: { display: "magyar", emoji: "🇭🇺", i18n: "hu" },
    id: { display: "bahasa Indonesia", emoji: "🇮🇩", i18n: "id" },
    lt: { display: "Lietuvių", emoji: "🇱🇹", i18n: "lt" },
    mk: { display: "Македонски", emoji: "🇲🇰", i18n: "mk" },
    nl: { display: "Nederlands", emoji: "🇳🇱", i18n: "nl" },
    pl: { display: "Polski", emoji: "🇵🇱", i18n: "pl" },
    pt_BR: {
        display: "Português (do Brasil)",
        emoji: "🇧🇷",
        i18n: "pt_BR",
        dayjs: "pt-br",
    },
    ro: { display: "Română", emoji: "🇷🇴", i18n: "ro" },
    ru: { display: "Русский", emoji: "🇷🇺", i18n: "ru" },
    sr: { display: "Српски", emoji: "🇷🇸", i18n: "sr" },
    sv: { display: "Svenska", emoji: "🇸🇪", i18n: "sv" },
    tr: { display: "Türkçe", emoji: "🇹🇷", i18n: "tr" },
    uk: { display: "Українська", emoji: "🇺🇦", i18n: "uk" },
    zh_Hans: {
        display: "中文 (简体)",
        emoji: "🇨🇳",
        i18n: "zh_Hans",
        dayjs: "zh",
    },

    owo: { display: "OwO", emoji: "🐱", i18n: "owo", dayjs: "en-gb", alt: true },
    pr: { display: "Pirate", emoji: "🏴‍☠️", i18n: "pr", dayjs: "en-gb", alt: true },
    bottom: { display: "Bottom", emoji: "🥺", i18n: "bottom", dayjs: "en-gb", alt: true },
    piglatin: {
        display: "Pig Latin",
        emoji: "🐖",
        i18n: "piglatin",
        dayjs: "en-gb",
        alt: true
    },
    hardcore: {
        display: "Hardcore Mode",
        emoji: "🔥",
        i18n: "hardcore",
        dayjs: "en-gb",
        alt: true
    },
};

interface Props {
    children: JSX.Element | JSX.Element[];
    locale: Language;
}

function Locale({ children, locale }: Props) {
    const [defns, setDefinition] = useState(definition);
    const lang = Languages[locale];

    useEffect(() => {
        if (locale === "en") {
            setDefinition(definition);
            dayjs.locale("en");
            return;
        }

        if (lang.i18n === "hardcore") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setDefinition({} as any);
            return;
        }

        import(`../../external/lang/${lang.i18n}.json`).then(
            async (lang_file) => {
                const defn = lang_file.default;
                const target = lang.dayjs ?? lang.i18n;
                const dayjs_locale = await import(`../../node_modules/dayjs/esm/locale/${target}.js`);

                if (defn.dayjs) {
                    dayjs.updateLocale(target, { calendar: defn.dayjs });
                }

                dayjs.locale(dayjs_locale.default);
                setDefinition(defn);
            }
        );
    }, [locale, lang]);

    useEffect(() => {
        document.body.style.direction = lang.rtl ? "rtl" : "";
    }, [lang.rtl]);

    return <IntlProvider definition={defns}>{children}</IntlProvider>;
}

export default connectState<Omit<Props, "locale">>(
    Locale,
    (state) => {
        return {
            locale: state.locale,
        };
    },
    true
);
