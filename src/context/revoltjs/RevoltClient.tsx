/* eslint-disable react-hooks/rules-of-hooks */
import { observer } from "mobx-react-lite";

import { useEffect } from "preact/hooks";

import { Preloader } from "@revoltchat/ui";

import { useApplicationState } from "../../mobx/State";

import { clientController } from "../../controllers/client/ClientController";

type Props = {
    children: Children;
};

export default observer(({ children }: Props) => {
    const session = clientController.getActiveSession();
    if (session) {
        if (!session.ready) return <Preloader type="spinner" />;

        const client = session.client!;
        const state = useApplicationState();
        useEffect(() => state.registerListeners(client), [state, client]);
    }

    return <>{children}</>;
});
