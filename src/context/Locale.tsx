import dayJS from "dayjs";
import calendar from "dayjs/plugin/calendar";
import format from "dayjs/plugin/localizedFormat";
import update from "dayjs/plugin/updateLocale";
import defaultsDeep from "lodash.defaultsdeep";
import { observer } from "mobx-react-lite";

import { IntlProvider, Text } from "preact-i18n";
import { useCallback, useEffect, useState } from "preact/hooks";

import { Error } from "@revoltchat/ui";

import { useApplicationState } from "../mobx/State";

import { Languages } from "../../external/lang/Languages";
import definition from "../../external/lang/en.json";

export const dayjs = dayJS;

dayjs.extend(calendar);
dayjs.extend(format);
dayjs.extend(update);

interface Props {
    children: JSX.Element | JSX.Element[];
}

export interface Dictionary {
    dayjs?: {
        defaults?: {
            twelvehour?: "yes" | "no";
            separator?: string;
            date?: "traditional" | "simplified" | "ISO8601";
        };
        timeFormat?: string;
    };
    [key: string]:
        | Record<string, Omit<Dictionary, "dayjs">>
        | string
        | undefined;
}

export default observer(({ children }: Props) => {
    const locale = useApplicationState().locale;
    const [definitions, setDefinition] = useState<Dictionary>(
        definition as Dictionary,
    );

    const lang = locale.getLanguage();
    const source = Languages[lang];

    const loadLanguage = useCallback(
        (locale: string) => {
            if (locale === "en") {
                // If English, make sure to restore everything to defaults.
                // Use what we already have.
                const defn = transformLanguage(definition as Dictionary);
                setDefinition(defn);
                dayjs.locale("en");
                dayjs.updateLocale("en", { calendar: defn.dayjs });
                return;
            }

            import(`../../external/lang/${source.i18n}.json`).then(
                async (lang_file) => {
                    // Transform the definitions data.
                    const defn = transformLanguage(lang_file.default);

                    // Determine and load dayjs locales.
                    const target = source.dayjs ?? source.i18n;
                    const dayjs_locale = await import(
                        `../../node_modules/dayjs/esm/locale/${target}.js`
                    );

                    // Load dayjs locales.
                    dayjs.locale(target, dayjs_locale.default);

                    if (defn.dayjs) {
                        // Override dayjs calendar locales with our own.
                        dayjs.updateLocale(target, { calendar: defn.dayjs });
                    }

                    // Apply definition to app.
                    setDefinition(defn);
                },
            );
        },
        [source.dayjs, source.i18n],
    );

    useEffect(() => loadLanguage(lang), [lang, source, loadLanguage]);

    useEffect(() => {
        // Apply RTL language format.
        document.body.style.direction = source.rtl ? "rtl" : "";
    }, [source.rtl]);

    return <IntlProvider definition={definitions}>{children}</IntlProvider>;
});

/**
 * Apply defaults and process dayjs entries for a langauge.
 * @param source Dictionary definition to transform
 * @returns Transformed dictionary definition
 */
function transformLanguage(source: Dictionary) {
    // Fallback untranslated strings to English (UK)
    const obj = defaultsDeep(source, definition);

    // Take relevant objects out, dayjs and defaults
    // should exist given we just took defaults above.
    const { dayjs } = obj;
    const { defaults } = dayjs;

    // Determine whether we are using 12-hour clock.
    const twelvehour = defaults?.twelvehour
        ? defaults.twelvehour === "yes"
        : false;

    // Determine what date separator we are using.
    const separator: string = defaults?.date_separator ?? "/";

    // Determine what date format we are using.
    const date: "traditional" | "simplified" | "ISO8601" =
        defaults?.date_format ?? "traditional";

    // Available date formats.
    const DATE_FORMATS = {
        traditional: `DD${separator}MM${separator}YYYY`,
        simplified: `MM${separator}DD${separator}YYYY`,
        ISO8601: "YYYY-MM-DD",
    };

    // Replace data in dayjs object, make sure to provide fallbacks.
    dayjs["sameElse"] = DATE_FORMATS[date] ?? DATE_FORMATS.traditional;
    dayjs["timeFormat"] = twelvehour ? "hh:mm A" : "HH:mm";

    // Replace {{time}} format string in dayjs strings with the time format.
    Object.keys(dayjs)
        .filter((k) => typeof dayjs[k] === "string")
        .forEach(
            (k) =>
                (dayjs[k] = dayjs[k].replace(/{{time}}/g, dayjs["timeFormat"])),
        );

    return obj;
}

export function I18nError({ error, children }: { error: any; children?: any }) {
    return (
        <Error
            error={error ? <Text id={error} children={error} /> : undefined}
            children={children}
        />
    );
}
