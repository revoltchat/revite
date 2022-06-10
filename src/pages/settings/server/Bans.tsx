import { XCircle } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Virtuoso } from "react-virtuoso";
import { API } from "revolt.js";
import { Server } from "revolt.js";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useMemo, useState } from "preact/hooks";

import { IconButton, InputBox, Preloader } from "@revoltchat/ui";

import UserIcon from "../../../components/common/user/UserIcon";

interface InnerProps {
    ban: API.ServerBan;
    users: Record<string, API.BannedUser>;
    server: Server;
    removeSelf: () => void;
}

const Inner = observer(({ ban, users, server, removeSelf }: InnerProps) => {
    const [deleting, setDelete] = useState(false);
    const user = users[ban._id.user];

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
                }}>
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
    const [result, setData] = useState<
        | {
              users: Record<string, API.BannedUser>;
              bans: API.BanListResult["bans"];
          }
        | undefined
    >(undefined);

    useEffect(() => {
        server
            .fetchBans()
            .then((data) => {
                const users: Record<string, API.BannedUser> = {};
                for (const user of data.users) {
                    users[user._id] = user;
                }

                return {
                    users,
                    bans: data.bans,
                };
            })
            .then(setData);
    }, [server, setData]);

    const bans = useMemo(() => {
        if (!result) return;

        if (query)
            return result.bans.filter(({ _id }) =>
                result.users[_id.user]?.username.includes(query),
            );

        return result.bans;
    }, [query, result]);

    return (
        <div className={styles.userList}>
            <InputBox
                placeholder="Search for a specific user..."
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                palette="secondary"
            />
            <div className={styles.subtitle}>
                <span>
                    <Text id="app.settings.server_pages.bans.user" />
                </span>
                <span className={styles.reason}>
                    <Text id="app.settings.server_pages.bans.reason" />
                </span>
                <span>
                    <Text id="app.settings.server_pages.bans.revoke" />
                </span>
            </div>
            {typeof bans === "undefined" && <Preloader type="ring" />}
            {bans && (
                <div className={styles.virtual}>
                    <Virtuoso
                        totalCount={bans.length}
                        itemContent={(index) => (
                            <Inner
                                key={bans[index]._id.user}
                                server={server}
                                users={result!.users}
                                ban={bans[index]}
                                removeSelf={() => {
                                    setData({
                                        bans: result!.bans.filter(
                                            (y) =>
                                                y._id.user !==
                                                bans[index]._id.user,
                                        ),
                                        users: result!.users,
                                    });
                                }}
                            />
                        )}
                    />
                </div>
            )}
        </div>
    );
});
