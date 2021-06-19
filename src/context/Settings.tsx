// This code is more or less redundant, but settings has so little state
// updates that I can't be asked to pass everything through props each
// time when I can just use the Context API.
//
// Replace references to SettingsContext with connectState in the future
// if it does cause problems though.

import { Settings } from "../redux/reducers/settings";
import { connectState } from "../redux/connector";
import { Children } from "../types/Preact";
import { createContext } from "preact";

export const SettingsContext = createContext<Settings>({} as any);

interface Props {
    children?: Children,
    settings: Settings
}

function Settings(props: Props) {
    return (
        <SettingsContext.Provider value={props.settings}>
            { props.children }
        </SettingsContext.Provider>
    )
}

export default connectState(Settings, state => {
    return {
        settings: state.settings
    }
});
