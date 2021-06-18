import { store } from ".";
import localForage from "localforage";
import { Provider } from "react-redux";
import { Children } from "../types/Preact";
import { useEffect, useState } from "preact/hooks";

async function loadState() {
    const state = await localForage.getItem("state");
    if (state) {
        store.dispatch({ type: "__INIT", state });
    }
}

interface Props {
    children: Children;
}

export default function State(props: Props) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        loadState().then(() => setLoaded(true));
    }, []);

    if (!loaded) return null;

    return <Provider store={store}>{props.children}</Provider>;
}
