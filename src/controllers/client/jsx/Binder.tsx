import { observer } from "mobx-react-lite";

import { useEffect } from "preact/hooks";

import { Preloader } from "@revoltchat/ui";

import { state } from "../../../mobx/State";

import { clientController } from "../ClientController";

/**
 * Prevent render until the client is ready to display.
 * Also binds listeners from state to the current client.
 */
const Binder: React.FC = ({ children }) => {
    const client = clientController.getReadyClient();
    useEffect(() => state.registerListeners(client!), [client]);

    // Block render if client is getting ready to work.
    if (clientController.isLoggedIn() && !clientController.isReady()) {
        return <Preloader type="spinner" />;
    }

    return <>{children}</>;
};

export default observer(Binder);
