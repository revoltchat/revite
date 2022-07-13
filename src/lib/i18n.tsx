import { IntlContext, translate } from "preact-i18n";
import { useContext } from "preact/hooks";

import { Dictionary } from "../context/Locale";

interface Fields {
    [key: string]: Children;
}

interface Props {
    id: string;
    fields: Fields;
}

export interface IntlType {
    intl: {
        dictionary: Dictionary;
    };
}

// This will exhibit O(2^n) behaviour.
function recursiveReplaceFields(input: string, fields: Fields) {
    const key = Object.keys(fields)[0];
    if (key) {
        const { [key]: field, ...restOfFields } = fields;
        if (typeof field === "undefined") return [input];

        const values: (Children | string[])[] = input
            .split(`{{${key}}}`)
            .map((v) => recursiveReplaceFields(v, restOfFields));

        for (let i = values.length - 1; i > 0; i -= 2) {
            values.splice(i, 0, field);
        }

        return values.flat();
    }
    // base case
    return [input];
}

export function TextReact({ id, fields }: Props) {
    const { intl } = useContext(IntlContext) as unknown as IntlType;

    const path = id.split(".");
    let entry = intl.dictionary[path.shift()!];
    for (const key of path) {
        // @ts-expect-error TODO: lazy
        entry = entry[key];
    }

    return <>{recursiveReplaceFields(entry as string, fields)}</>;
}

export function useTranslation() {
    const { intl } = useContext(IntlContext) as unknown as IntlType;
    return (
        id: string,
        fields?: Record<string, string | undefined>,
        plural?: number,
        fallback?: string,
    ) => translate(id, "", intl.dictionary, fields, plural, fallback);
}

export function useDictionary() {
    const { intl } = useContext(IntlContext) as unknown as IntlType;
    return intl.dictionary;
}
