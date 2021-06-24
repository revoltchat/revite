// This code is more or less redundant, but settings has so little state
// updates that I can't be asked to pass everything through props each
// time when I can just use the Context API.
//
// Replace references to SettingsContext with connectState in the future
// if it does cause problems though.
//
// This now also supports Audio stuff.

import { DEFAULT_SOUNDS, Settings, SoundOptions } from "../redux/reducers/settings";
import { playSound, Sounds } from "../assets/sounds/Audio";
import { connectState } from "../redux/connector";
import defaultsDeep from "lodash.defaultsdeep";
import { Children } from "../types/Preact";
import { createContext } from "preact";
import { useMemo } from "preact/hooks";

export const SettingsContext = createContext<Settings>({} as any);
export const SoundContext = createContext<(sound: Sounds) => void>({} as any);

interface Props {
    children?: Children,
    settings: Settings
}

function Settings({ settings, children }: Props) {
    console.info(settings.notification);
    const play = useMemo(() => {
        const enabled: SoundOptions = defaultsDeep(settings.notification ?? {}, DEFAULT_SOUNDS);
        return (sound: Sounds) => {
            console.info('check if we can play sound', enabled[sound]);
            if (enabled[sound]) {
                playSound(sound);
            }
        };
    }, [ settings.notification ]);

    return (
        <SettingsContext.Provider value={settings}>
            <SoundContext.Provider value={play}>
                { children }
            </SoundContext.Provider>
        </SettingsContext.Provider>
    )
}

export default connectState<Omit<Props, 'settings'>>(Settings, state => {
    return {
        settings: state.settings
    }
});
