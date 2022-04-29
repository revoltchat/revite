import { XCircle } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Virtuoso } from "react-virtuoso";
import { API } from "revolt.js";
import { Server } from "revolt.js";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import UserIcon from "../../../components/common/user/UserIcon";
import IconButton from "../../../components/ui/IconButton";
import InputBox from "../../../components/ui/InputBox";
import Preloader from "../../../components/ui/Preloader";

interface InnerProps {
    ban: API.ServerBan;
    users: Pick<API.User, "username" | "avatar" | "_id">[];
    server: Server;
    removeSelf: () => void;
}

const Inner = observer(({ ban, users, server, removeSelf }: InnerProps) => {
    const [deleting, setDelete] = useState(false);
    const user = users.find((x) => x._id === ban._id.user);

    return (
        <div className={styles.ban} data-deleting={deleting}>
            <span>
                <UserIcon attachment={user?.avatar ?? undefined} size={24} />{" "}
                {user?.username}
            </span>
            <div className={styles.reason}>
                {ban.reason ?? (
                    <Text id="app.settings.server_pages.bans.no_reason" />
                )}
            </div>
            <IconButton
                onClick={() => {
                    setDelete(true);
                    server.unbanUser(ban._id.user).then(removeSelf);
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

export const Bans = observer(({ server }: Props) => {
    const [query, setQuery] = useState("");
    const [data, setData] = useState<API.BanListResult | undefined>(undefined);

    useEffect(() => {
        server.fetchBans().then(setData);
    }, [server, setData]);

    return (
        <div className={styles.userList}>
            <InputBox
                placeholder="Search for a specific user..."
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                contrast
            />
            <div className={styles.subtitle}>
                <span>
                    <Text id="app.settings.server_pages.bans.user" />
                </span>
                <span class={styles.reason}>
                    <Text id="app.settings.server_pages.bans.reason" />
                </span>
                <span>
                    <Text id="app.settings.server_pages.bans.revoke" />
                </span>
            </div>
            {typeof data === "undefined" && <Preloader type="ring" />}
            {data && (
                <div className={styles.virtual}>
                    <Virtuoso
                        totalCount={data.bans.length}
                        itemContent={(index) =>
                            (!query ||
                                data.users
                                    .find(
                                        (u) =>
                                            u._id == data.bans[index]._id.user,
                                    )
                                    ?.username.toLowerCase()
                                    .includes(query.toLowerCase())) && (
                                <Inner
                                    key={data.bans[index]._id.user}
                                    server={server}
                                    users={data.users}
                                    ban={data.bans[index]}
                                    removeSelf={() => {
                                        setData({
                                            bans: data.bans.filter(
                                                (y) =>
                                                    y._id.user !==
                                                    data.bans[index]._id.user,
                                            ),
                                            users: data.users,
                                        });
                                    }}
                                />
                            )
                        }
                    />
                </div>
            )}
        </div>
    );
});
