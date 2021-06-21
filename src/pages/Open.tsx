import { Text } from "preact-i18n";
import Header from "../components/ui/Header";
import { useContext, useEffect } from "preact/hooks";
import { useHistory, useParams } from "react-router-dom";
import { useIntermediate } from "../context/intermediate/Intermediate";
import { useChannels, useForceUpdate, useUser } from "../context/revoltjs/hooks";
import { AppContext, ClientStatus, StatusContext } from "../context/revoltjs/RevoltClient";

export default function Open() {
    const history = useHistory();
    const client = useContext(AppContext);
    const status = useContext(StatusContext);
    const { id } = useParams<{ id: string }>();
    const { openScreen } = useIntermediate();

    if (status !== ClientStatus.ONLINE) {
        return (
            <Header placement="primary">
                <Text id="general.loading" />
            </Header>
        );
    }

    const ctx = useForceUpdate();
    const channels = useChannels(undefined, ctx);
    const user = useUser(id, ctx);

    useEffect(() => {
        if (id === "saved") {
            for (const channel of channels) {
                if (channel?.channel_type === "SavedMessages") {
                    history.push(`/channel/${channel._id}`);
                    return;
                }
            }

            client.users
                .openDM(client.user?._id as string)
                .then(channel => history.push(`/channel/${channel?._id}`))
                .catch(error => openScreen({ id: "error", error }));

            return;
        }

        if (user) {
            const channel: string | undefined = channels.find(
                channel =>
                    channel?.channel_type === "DirectMessage" &&
                    channel.recipients.includes(id)
            )?._id;

            if (channel) {
                history.push(`/channel/${channel}`);
            } else {
                client.users
                    .openDM(id)
                    .then(channel => history.push(`/channel/${channel?._id}`))
                    .catch(error => openScreen({ id: "error", error }));
            }

            return;
        }

        history.push("/");
    }, []);

    return (
        <Header placement="primary">
            <Text id="general.loading" />
        </Header>
    );
}
