import { ArrowBack } from "@styled-icons/boxicons-regular";
import { autorun } from "mobx";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { RetrievedInvite } from "revolt-api/types/Invites";

import styles from "./Invite.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { defer } from "../../lib/defer";
import { TextReact } from "../../lib/i18n";
import { Preloader } from "@revoltchat/ui/lib/components/atoms/indicators/Preloader";
import { Button } from "@revoltchat/ui/lib/components/atoms/inputs/Button";
import { Category } from "@revoltchat/ui/lib/components/atoms/layout/Category";

import { useApplicationState } from "../../mobx/State";

import { I18nError } from "../../context/Locale";
import RequiresOnline from "../../context/revoltjs/RequiresOnline";
import {
    AppContext,
    ClientStatus,
    StatusContext,
} from "../../context/revoltjs/RevoltClient";
import { takeError } from "../../context/revoltjs/util";

import ServerIcon from "../../components/common/ServerIcon";
import UserIcon from "../../components/common/user/UserIcon";

export default function Invite() {
    const history = useHistory();
    const client = useContext(AppContext);

    const layout = useApplicationState().layout;

    const status = useContext(StatusContext);
    const { code } = useParams<{ code: string }>();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [invite, setInvite] = useState<RetrievedInvite | undefined>(
        undefined,
    );

    useEffect(() => {
        if (typeof invite === "undefined") {
            client
                .fetchInvite(code)
                .then((data) => setInvite(data))
                .catch((err) => setError(takeError(err)));
        }
    }, [client, code, invite, status]);

    if (code === undefined) return <Redirect to={layout.getLastPath()} />;

    if (typeof invite === "undefined") {
        return (
            <div className={styles.preloader}>
                <RequiresOnline>
                    {error ? (
                        <div
                            className={styles.invite}
                            style={{
                                backgroundImage: `url('https://autumn.revolt.chat/banners/yMurJiXf45VJpbal0X2zQkm4vaXsXGaRtoPUIcvPcH')`,
                                width: "100%",
                                height: "100%",
                            }}>
                            <div className={styles.details}>
                                <h1>
                                    <Text id="app.special.invite.invalid" />
                                </h1>
                                <h2>
                                    <Text id="app.special.invite.invalid_desc" />
                                </h2>
                                <div style="cursor: pointer;">
                                    <Button palette="secondary">
                                        <ArrowBack
                                            size={32}
                                            onClick={() =>
                                                history.push(
                                                    layout.getLastPath(),
                                                )
                                            }
                                        />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Preloader type="spinner" />
                    )}
                </RequiresOnline>
            </div>
        );
    }

    return (
        <div
            className={styles.invite}
            style={{
                backgroundImage: invite.server_banner
                    ? `url('${client?.generateFileURL(invite.server_banner)}')`
                    : undefined,
            }}>
            <div className={styles.leave}>
                <ArrowBack
                    size={32}
                    onClick={() => history.push(layout.getLastPath())}
                />
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
                        <h2>
                            #{invite.channel_name} •{" "}
                            <Text
                                id="app.special.invite.user_count"
                                fields={{
                                    member_count: invite.member_count,
                                }}
                            />
                        </h2>
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
                        <Category>
                            <I18nError error={error} />
                        </Category>
                        <Button
                            palette="secondary"
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
                                                    client.unreads!.markMultipleRead(
                                                        server.channel_ids,
                                                    );

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
