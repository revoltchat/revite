import { useMemo } from "preact/hooks";

import { useApplicationState } from "../mobx/State";

import { AppContext } from "../context/revoltjs/RevoltClient";

import { Children } from "../types/Preact";

export default function FakeClient({ children }: { children: Children }) {
    const config = useApplicationState().config;
    const client = useMemo(() => config.createClient(), []);
    return <AppContext.Provider value={client}>{children}</AppContext.Provider>;
}
