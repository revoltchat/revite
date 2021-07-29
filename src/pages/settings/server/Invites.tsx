import { XCircle } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Invites as InvitesNS, Servers } from "revolt.js/dist/api/objects";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { useData } from "../../../mobx/State";

import { useClient } from "../../../context/revoltjs/RevoltClient";
import {
    useChannels,
    useForceUpdate,
    useUsers,
} from "../../../context/revoltjs/hooks";
import { getChannelName } from "../../../context/revoltjs/util";

import UserIcon from "../../../components/common/user/UserIcon";
import IconButton from "../../../components/ui/IconButton";
import Preloader from "../../../components/ui/Preloader";

interface Props {
    server: Servers.Server;
}

export const Invites = observer(({ server }: Props) => {
    const [deleting, setDelete] = useState<string[]>([]);
    const [invites, setInvites] = useState<
        InvitesNS.ServerInvite[] | undefined
    >(undefined);

    const ctx = useForceUpdate();
    const channels = useChannels(invites?.map((x) => x.channel) ?? [], ctx);

    const store = useData();
    const client = useClient();
    const users = invites?.map((invite) => store.users.get(invite.creator));

    useEffect(() => {
        ctx.client.servers
            .fetchInvites(server._id)
            .then((invites) => setInvites(invites));
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
                const channel = channels.find((x) => x?._id === invite.channel);

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
                                ? getChannelName(ctx.client, channel, true)
                                : "#??"}
                        </span>
                        <IconButton
                            onClick={async () => {
                                setDelete([...deleting, invite._id]);

                                await ctx.client.deleteInvite(invite._id);

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
