import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import { useClient } from "../context/revoltjs/RevoltClient";

import { DataStore } from ".";
import { Children } from "../types/Preact";

interface Props {
    children: Children;
}

export const DataContext = createContext<DataStore>(null!);

// ! later we can do seamless account switching, by hooking this into Redux
// ! and monitoring changes to active account and hence swapping stores.
// although this may need more work since we need a Client per account too.

export default function StateLoader(props: Props) {
    const client = useClient();
    const [store] = useState(new DataStore(client));

    useEffect(() => {
        const packet = (packet: ClientboundNotification) =>
            store.packet(packet);
        client.addListener("packet", packet);
        return () => client.removeListener("packet", packet);
    }, [client]);

    return (
        <DataContext.Provider value={store}>
            {props.children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
