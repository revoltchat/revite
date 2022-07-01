/* eslint-disable react-hooks/rules-of-hooks */
import { useHistory, useParams } from "react-router-dom";

import { Text } from "preact-i18n";
import { useEffect } from "preact/hooks";

import { Header } from "@revoltchat/ui";

import { useSession } from "../controllers/client/ClientController";
import { modalController } from "../controllers/modals/ModalController";

export default function Open() {
    const history = useHistory();
    const session = useSession()!;
    const client = session.client!;
    const { id } = useParams<{ id: string }>();

    if (session.state !== "Online") {
        return (
            <Header palette="primary">
                <Text id="general.loading" />
            </Header>
        );
    }

    useEffect(() => {
        if (id === "saved") {
            for (const channel of [...client.channels.values()]) {
                if (channel?.channel_type === "SavedMessages") {
                    history.push(`/channel/${channel._id}`);
                    return;
                }
            }

            client
                .user!.openDM()
                .then((channel) => history.push(`/channel/${channel?._id}`))
                .catch((error) =>
                    modalController.push({
                        type: "error",
                        error,
                    }),
                );

            return;
        }

        const user = client.users.get(id);
        if (user) {
            const channel: string | undefined = [
                ...client.channels.values(),
            ].find(
                (channel) =>
                    channel?.channel_type === "DirectMessage" &&
                    channel.recipient_ids!.includes(id),
            )?._id;

            if (channel) {
                history.push(`/channel/${channel}`);
            } else {
                client.users
                    .get(id)
                    ?.openDM()
                    .then((channel) => history.push(`/channel/${channel?._id}`))
                    .catch((error) =>
                        modalController.push({
                            type: "error",
                            error,
                        }),
                    );
            }

            return;
        }

        history.push("/");
    });

    return (
        <Header palette="primary">
            <Text id="general.loading" />
        </Header>
    );
}
