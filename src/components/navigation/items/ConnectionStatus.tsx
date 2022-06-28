import { observer } from "mobx-react-lite";

import { Text } from "preact-i18n";

import { Banner } from "@revoltchat/ui";

import { useSession } from "../../../controllers/client/ClientController";

function ConnectionStatus() {
    const session = useSession()!;

    if (session.state === "Offline") {
        return (
            <Banner>
                <Text id="app.special.status.offline" />
            </Banner>
        );
    } else if (session.state === "Disconnected") {
        return (
            <Banner>
                <Text id="app.special.status.disconnected" /> <br />
                <a
                    onClick={() =>
                        session.emit({
                            action: "RETRY",
                        })
                    }>
                    <Text id="app.special.status.reconnect" />
                </a>
            </Banner>
        );
    } else if (session.state === "Connecting") {
        return (
            <Banner>
                <Text id="app.special.status.reconnecting" />
            </Banner>
        );
    }

    return null;
}

export default observer(ConnectionStatus);
