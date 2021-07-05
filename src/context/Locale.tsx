import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import format from "dayjs/plugin/localizedFormat";
import update from "dayjs/plugin/updateLocale";
import defaultsDeep from "lodash.defaultsdeep";

import { IntlProvider } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { connectState } from "../redux/connector";

import definition from "../../external/lang/en.json";

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

    owo: {
        display: "OwO",
        emoji: "🐱",
        i18n: "owo",
        dayjs: "en-gb",
        alt: true,
    },
    pr: {
        display: "Pirate",
        emoji: "🏴‍☠️",
        i18n: "pr",
        dayjs: "en-gb",
        alt: true,
    },
    bottom: {
        display: "Bottom",
        emoji: "🥺",
        i18n: "bottom",
        dayjs: "en-gb",
        alt: true,
    },
    piglatin: {
        display: "Pig Latin",
        emoji: "🐖",
        i18n: "piglatin",
        dayjs: "en-gb",
        alt: true,
    },
};

interface Props {
    children: JSX.Element | JSX.Element[];
    locale: Language;
}

function Locale({ children, locale }: Props) {
    // TODO: create and use LanguageDefinition type here
    const [defns, setDefinition] =
        useState<Record<string, unknown>>(definition);
    const lang = Languages[locale];

    // TODO: clean this up and use the built in Intl API
    function transformLanguage(source: { [key: string]: any }) {
        const obj = defaultsDeep(source, definition);

        const dayjs = obj.dayjs;
        const defaults = dayjs.defaults;

        const twelvehour = defaults?.twelvehour === "yes" || true;
        const separator: "/" | "-" | "." = defaults?.date_separator ?? "/";
        const date: "traditional" | "simplified" | "ISO8601" =
            defaults?.date_format ?? "traditional";

        const DATE_FORMATS = {
            traditional: `DD${separator}MM${separator}YYYY`,
            simplified: `MM${separator}DD${separator}YYYY`,
            ISO8601: "YYYY-MM-DD",
        };

        dayjs["sameElse"] = DATE_FORMATS[date];
        Object.keys(dayjs)
            .filter((k) => k !== "defaults")
            .forEach(
                (k) =>
                    (dayjs[k] = dayjs[k].replace(
                        /{{time}}/g,
                        twelvehour ? "LT" : "HH:mm",
                    )),
            );

        return obj;
    }

    useEffect(() => {
        if (locale === "en") {
            const defn = transformLanguage(definition);
            setDefinition(defn);
            dayjs.locale("en");
            dayjs.updateLocale("en", { calendar: defn.dayjs });
            return;
        }

        import(`../../external/lang/${lang.i18n}.json`).then(
            async (lang_file) => {
                const defn = transformLanguage(lang_file.default);
                const target = lang.dayjs ?? lang.i18n;
                const dayjs_locale = await import(
                    `../../node_modules/dayjs/esm/locale/${target}.js`
                );

                if (defn.dayjs) {
                    dayjs.updateLocale(target, { calendar: defn.dayjs });
                }

                dayjs.locale(dayjs_locale.default);
                setDefinition(defn);
            },
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
    true,
);
