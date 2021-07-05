import { IntlContext, translate } from "preact-i18n";
import { useContext } from "preact/hooks";

import { Children } from "../types/Preact";

interface Fields {
	[key: string]: Children;
}

interface Props {
	id: string;
	fields: Fields;
}

export interface IntlType {
	intl: {
		dictionary: {
			[key: string]: Object | string;
		};
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
	} else {
		// base case
		return [input];
	}
}

export function TextReact({ id, fields }: Props) {
	const { intl } = useContext(IntlContext) as unknown as IntlType;

	const path = id.split(".");
	let entry = intl.dictionary[path.shift()!];
	for (let key of path) {
		// @ts-expect-error
		entry = entry[key];
	}

	return <>{recursiveReplaceFields(entry as string, fields)}</>;
}

export function useTranslation() {
	const { intl } = useContext(IntlContext) as unknown as IntlType;
	return (id: string, fields?: Object, plural?: number, fallback?: string) =>
		translate(id, "", intl.dictionary, fields, plural, fallback);
}
