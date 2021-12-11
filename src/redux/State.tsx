import localForage from "localforage";
import { Provider } from "react-redux";

import { useEffect, useRef, useState } from "preact/hooks";

import MobXState, { StateContextProvider } from "../mobx/State";

import { dispatch, State, store } from ".";
import { Children } from "../types/Preact";

interface Props {
    children: Children;
}

/**
 * Component for loading application state.
 * @param props Provided children
 */
export default function StateLoader(props: Props) {
    const [loaded, setLoaded] = useState(false);
    const { current: state } = useRef(new MobXState());

    // Globally expose the application state.
    useEffect(() => {
        (window as unknown as Record<string, unknown>).state = state;
    }, [state]);

    useEffect(() => {
        localForage.getItem("state").then((s) => {
            if (s !== null) {
                dispatch({ type: "__INIT", state: s as State });
            }

            state.hydrate().then(() => setLoaded(true));
        });
    }, []);

    if (!loaded) return null;

    useEffect(state.registerListeners);

    return (
        <Provider store={store}>
            <StateContextProvider value={state}>
                {props.children}
            </StateContextProvider>
        </Provider>
    );
}
