import { observer } from "mobx-react-lite";

import { useEffect } from "preact/hooks";

import { state } from "../../../mobx/State";

import { clientController } from "../ClientController";

/**
 * Also binds listeners from state to the current client.
 */
const Binder: React.FC = () => {
    const client = clientController.getReadyClient();
    useEffect(() => state.registerListeners(client!), [client]);
    return null;
};

export default observer(Binder);
