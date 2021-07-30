import { XCircle } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { ServerInvite } from "revolt-api/types/Invites";
import { Server } from "revolt.js/dist/maps/Servers";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { useClient } from "../../../context/revoltjs/RevoltClient";
import { getChannelName } from "../../../context/revoltjs/util";

import UserIcon from "../../../components/common/user/UserIcon";
import IconButton from "../../../components/ui/IconButton";
import Preloader from "../../../components/ui/Preloader";

interface Props {
    server: Server;
}

export const Invites = observer(({ server }: Props) => {
    const [deleting, setDelete] = useState<string[]>([]);
    const [invites, setInvites] = useState<ServerInvite[] | undefined>(
        undefined,
    );

    const client = useClient();
    const users = invites?.map((invite) => client.users.get(invite.creator));
    const channels = invites?.map((invite) =>
        client.channels.get(invite.channel),
    );

    useEffect(() => {
        server.fetchInvites().then(setInvites);
    }, []);

    return (
        <div className={styles.userList}>
            <div className={styles.subtitle}>
                <span>
                    <Text id="app.settings.server_pages.invites.code" />
                </span>
                <span>
                    <Text id="app.settings.server_pages.invites.invitor" />
                </span>
                <span>
                    <Text id="app.settings.server_pages.invites.channel" />
                </span>
                <span>
                    <Text id="app.settings.server_pages.invites.revoke" />
                </span>
            </div>
            {typeof invites === "undefined" && <Preloader type="ring" />}
            {invites?.map((invite, index) => {
                const creator = users![index];
                const channel = channels![index];

                return (
                    <div
                        className={styles.invite}
                        data-deleting={deleting.indexOf(invite._id) > -1}>
                        <code>{invite._id}</code>
                        <span>
                            <UserIcon target={creator} size={24} />{" "}
                            {creator?.username ?? (
                                <Text id="app.main.channel.unknown_user" />
                            )}
                        </span>
                        <span>
                            {channel && creator
                                ? getChannelName(channel, true)
                                : "#??"}
                        </span>
                        <IconButton
                            onClick={async () => {
                                setDelete([...deleting, invite._id]);

                                await client.deleteInvite(invite._id);

                                setInvites(
                                    invites?.filter(
                                        (x) => x._id !== invite._id,
                                    ),
                                );
                            }}
                            disabled={deleting.indexOf(invite._id) > -1}>
                            <XCircle size={24} />
                        </IconButton>
                    </div>
                );
            })}
        </div>
    );
});
