// This code is more or less redundant, but settings has so little state
// updates that I can't be asked to pass everything through props each
// time when I can just use the Context API.
//
// Replace references to SettingsContext with connectState in the future
// if it does cause problems though.
//
// This now also supports Audio stuff.
import defaultsDeep from "lodash.defaultsdeep";

import { createContext } from "preact";
import { useMemo } from "preact/hooks";

import { connectState } from "../redux/connector";
import {
	DEFAULT_SOUNDS,
	Settings,
	SoundOptions,
} from "../redux/reducers/settings";

import { playSound, Sounds } from "../assets/sounds/Audio";
import { Children } from "../types/Preact";

export const SettingsContext = createContext<Settings>({});
export const SoundContext = createContext<(sound: Sounds) => void>(null!);

interface Props {
	children?: Children;
	settings: Settings;
}

function SettingsProvider({ settings, children }: Props) {
	const play = useMemo(() => {
		const enabled: SoundOptions = defaultsDeep(
			settings.notification?.sounds ?? {},
			DEFAULT_SOUNDS,
		);
		return (sound: Sounds) => {
			if (enabled[sound]) {
				playSound(sound);
			}
		};
	}, [settings.notification]);

	return (
		<SettingsContext.Provider value={settings}>
			<SoundContext.Provider value={play}>
				{children}
			</SoundContext.Provider>
		</SettingsContext.Provider>
	);
}

export default connectState<Omit<Props, "settings">>(
	SettingsProvider,
	(state) => {
		return {
			settings: state.settings,
		};
	},
);
