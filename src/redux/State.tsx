import localForage from "localforage";
import { Provider } from "react-redux";
import { Children } from "../types/Preact";
import { dispatch, State, store } from ".";
import { useEffect, useState } from "preact/hooks";

interface Props {
    children: Children;
}

export default function State(props: Props) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        localForage.getItem("state")
            .then(state => {
                if (state !== null) {
                    dispatch({ type: "__INIT", state: state as State });
                }
                
                setLoaded(true);
            });
    }, []);

    if (!loaded) return null;
    return <Provider store={store}>{props.children}</Provider>;
}
