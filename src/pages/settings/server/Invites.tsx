import { XCircle } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Virtuoso } from "react-virtuoso";
import { Invite, ServerInvite } from "revolt-api/types/Invites";
import { Server } from "revolt.js/dist/maps/Servers";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { getChannelName } from "../../../context/revoltjs/util";

import UserIcon from "../../../components/common/user/UserIcon";
import { Username } from "../../../components/common/user/UserShort";
import IconButton from "../../../components/ui/IconButton";
import Preloader from "../../../components/ui/Preloader";

interface InnerProps {
    invite: Invite;
    server: Server;
    removeSelf: () => void;
}

const Inner = observer(({ invite, server, removeSelf }: InnerProps) => {
    const [deleting, setDelete] = useState(false);

    const user = server.client.users.get(invite.creator);
    const channel = server.client.channels.get(invite.channel);

    return (
        <div className={styles.invite} data-deleting={deleting}>
            <code>{invite._id}</code>
            <span>
                <UserIcon target={user} size={24} />{" "}
                <Username user={user} showServerIdentity="both" />
            </span>
            <span>{channel ? getChannelName(channel, true) : "#??"}</span>
            <IconButton
                onClick={() => {
                    setDelete(true);
                    server.client.deleteInvite(invite._id).then(removeSelf);
                }}
                disabled={deleting}>
                <XCircle size={24} />
            </IconButton>
        </div>
    );
});

interface Props {
    server: Server;
}

export const Invites = ({ server }: Props) => {
    const [invites, setInvites] = useState<ServerInvite[] | undefined>(
        undefined,
    );

    useEffect(() => {
        server.fetchInvites().then(setInvites);
    }, [server, setInvites]);

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
            {invites && (
                <div className={styles.virtual}>
                    <Virtuoso
                        totalCount={invites.length}
                        itemContent={(index) => (
                            <Inner
                                key={invites[index]._id}
                                invite={invites[index]}
                                server={server}
                                removeSelf={() =>
                                    setInvites(
                                        invites.filter(
                                            (x) => x._id !== invites[index]._id,
                                        ),
                                    )
                                }
                            />
                        )}
                    />
                </div>
            )}
        </div>
    );
};
