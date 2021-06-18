import { store } from ".";
import localForage from "localforage";
import { Provider } from "react-redux";
import { Children } from "../types/Preact";
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
                    store.dispatch({ type: "__INIT", state });
                }
                
                setLoaded(true);
            });
    }, []);

    if (!loaded) return null;
    return <Provider store={store}>{props.children}</Provider>;
}
