import { observer } from "mobx-react-lite";

import { useMemo } from "preact/hooks";

import { useApplicationState } from "../mobx/State";

import { AppContext } from "../context/revoltjs/RevoltClient";

import { Children } from "../types/Preact";

export default observer(({ children }: { children: Children }) => {
    const config = useApplicationState().config;
    const client = useMemo(() => config.createClient(), [config.get()]);
    return <AppContext.Provider value={client}>{children}</AppContext.Provider>;
});
