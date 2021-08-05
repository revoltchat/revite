import { ArrowBack } from "@styled-icons/boxicons-regular";
import { autorun } from "mobx";
import { useHistory, useParams } from "react-router-dom";
import { RetrievedInvite } from "revolt-api/types/Invites";

import styles from "./Invite.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { defer } from "../../lib/defer";
import { TextReact } from "../../lib/i18n";

import RequiresOnline from "../../context/revoltjs/RequiresOnline";
import {
    AppContext,
    ClientStatus,
    StatusContext,
} from "../../context/revoltjs/RevoltClient";
import { takeError } from "../../context/revoltjs/util";

import ServerIcon from "../../components/common/ServerIcon";
import UserIcon from "../../components/common/user/UserIcon";
import Button from "../../components/ui/Button";
import Overline from "../../components/ui/Overline";
import Preloader from "../../components/ui/Preloader";

export default function Invite() {
    const history = useHistory();
    const client = useContext(AppContext);
    const status = useContext(StatusContext);
    const { code } = useParams<{ code: string }>();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [invite, setInvite] = useState<RetrievedInvite | undefined>(
        undefined,
    );

    useEffect(() => {
        if (
            typeof invite === "undefined" &&
            (status === ClientStatus.ONLINE || status === ClientStatus.READY)
        ) {
            client
                .fetchInvite(code)
                .then((data) => setInvite(data))
                .catch((err) => setError(takeError(err)));
        }
    }, [client, code, invite, status]);

    if (typeof invite === "undefined") {
        return (
            <div className={styles.preloader}>
                <RequiresOnline>
                    {error ? (
                        <Overline type="error" error={error} />
                    ) : (
                        <Preloader type="spinner" />
                    )}
                </RequiresOnline>
            </div>
        );
    }

    // ! FIXME: add i18n translations
    return (
        <div
            className={styles.invite}
            style={{
                backgroundImage: invite.server_banner
                    ? `url('${client.generateFileURL(invite.server_banner)}')`
                    : undefined,
            }}>
            <div className={styles.leave}>
                <ArrowBack size={32} onClick={() => history.push("/")} />
            </div>

            {!processing && (
                <div className={styles.icon}>
                    <ServerIcon
                        attachment={invite.server_icon}
                        server_name={invite.server_name}
                        size={64}
                    />
                </div>
            )}

            <div className={styles.details}>
                {processing ? (
                    <Preloader type="ring" />
                ) : (
                    <>
                        <h1>{invite.server_name}</h1>
                        <h2>#{invite.channel_name}</h2>
                        <h3>
                            <TextReact
                                id="app.special.invite.invited_by"
                                fields={{
                                    user: (
                                        <>
                                            <UserIcon
                                                size={24}
                                                attachment={invite.user_avatar}
                                            />{" "}
                                            {invite.user_name}
                                        </>
                                    ),
                                }}
                            />
                        </h3>
                        <Overline type="error" error={error} />
                        <Button
                            contrast
                            onClick={async () => {
                                if (status === ClientStatus.READY) {
                                    return history.push("/");
                                }

                                try {
                                    setProcessing(true);

                                    if (invite.type === "Server") {
                                        if (
                                            client.servers.get(invite.server_id)
                                        ) {
                                            history.push(
                                                `/server/${invite.server_id}/channel/${invite.channel_id}`,
                                            );
                                        }

                                        const dispose = autorun(() => {
                                            const server = client.servers.get(
                                                invite.server_id,
                                            );

                                            defer(() => {
                                                if (server) {
                                                    history.push(
                                                        `/server/${server._id}/channel/${invite.channel_id}`,
                                                    );
                                                }
                                            });

                                            dispose();
                                        });
                                    }

                                    await client.joinInvite(code);
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                }
                            }}>
                            {status === ClientStatus.READY ? (
                                <Text id="app.special.invite.login" />
                            ) : (
                                <Text id="app.special.invite.accept" />
                            )}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
