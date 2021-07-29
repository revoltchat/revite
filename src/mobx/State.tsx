import { createContext } from "preact";
import { useContext } from "preact/hooks";

import { DataStore } from ".";
import { Children } from "../types/Preact";

interface Props {
    children: Children;
}

export const DataContext = createContext<DataStore>(null!);

// ! later we can do seamless account switching, by hooking this into Redux
// ! and monitoring changes to active account and hence swapping stores.
// although this may need more work since we need a Client per account too.
const store = new DataStore();

export default function StateLoader(props: Props) {
    return (
        <DataContext.Provider value={store}>
            {props.children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
