import localForage from "localforage";
import { Provider } from "react-redux";

import { useEffect, useState } from "preact/hooks";

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
    const [state] = useState(new MobXState());

    useEffect(() => {
        localForage.getItem("state").then((state) => {
            if (state !== null) {
                dispatch({ type: "__INIT", state: state as State });
            }

            setLoaded(true);
        });
    }, []);

    if (!loaded) return null;
    return (
        <Provider store={store}>
            <StateContextProvider value={state}>
                {props.children}
            </StateContextProvider>
        </Provider>
    );
}
