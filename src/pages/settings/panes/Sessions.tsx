import { Chrome, Android, Windows } from "@styled-icons/boxicons-logos";
import { HelpCircle, Desktop, LogOut } from "@styled-icons/boxicons-regular";
import {
    Safari,
    Firefoxbrowser,
    Microsoftedge,
    Linux,
    Macos,
    Ios,
    Opera,
    Samsung,
    Windowsxp,
} from "@styled-icons/simple-icons";
import relativeTime from "dayjs/plugin/relativeTime";
import { useHistory } from "react-router-dom";
import { API } from "revolt.js";
import { decodeTime } from "ulid";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import {
    Button,
    CategoryButton,
    LineDivider,
    Preloader,
    Tip,
} from "@revoltchat/ui";

import { dayjs } from "../../../context/Locale";

import { useClient } from "../../../controllers/client/ClientController";
import { modalController } from "../../../controllers/modals/ModalController";

dayjs.extend(relativeTime);

export function Sessions() {
    const client = useClient();
    const deviceId =
        typeof client.session === "object"
            ? (client.session as unknown as { _id: string })._id
            : undefined;

    const [sessions, setSessions] = useState<API.SessionInfo[] | undefined>(
        undefined,
    );
    const [attemptingDelete, setDelete] = useState<string[]>([]);
    const history = useHistory();

    function switchPage(to: string) {
        history.replace(`/settings/${to}`);
    }

    useEffect(() => {
        client.api.get("/auth/session/all").then((data) => {
            data.sort(
                (a, b) =>
                    (b._id === deviceId ? 1 : 0) - (a._id === deviceId ? 1 : 0),
            );
            setSessions(data);
        });
    }, [client, setSessions, deviceId]);

    if (typeof sessions === "undefined") {
        return (
            <div className={styles.loader}>
                <Preloader type="ring" />
            </div>
        );
    }

    function getIcon(session: API.SessionInfo) {
        const name = session.name;
        switch (true) {
            case /firefox/i.test(name):
                return <Firefoxbrowser size={32} />;
            case /chrome/i.test(name):
                return <Chrome size={32} />;
            case /safari/i.test(name):
                return <Safari size={32} />;
            case /edge/i.test(name):
                return <Microsoftedge size={32} />;
            case /opera/i.test(name):
                return <Opera size={32} />;
            case /samsung/i.test(name):
                return <Samsung size={32} />;
            case /desktop/i.test(name):
                return <Desktop size={32} />;
            default:
                return <HelpCircle size={32} />;
        }
    }

    function getSystemIcon(session: API.SessionInfo) {
        const name = session.name;
        switch (true) {
            case /linux/i.test(name):
                return <Linux size={14} />;
            case /android/i.test(name):
                return <Android size={14} />;
            case /mac.*os/i.test(name):
                return <Macos size={14} />;
            case /i(Pad)?os/i.test(name):
                return <Ios size={14} />;
            case /windows 7/i.test(name):
                return <Windowsxp size={14} />;
            case /windows/i.test(name):
                return <Windows size={14} />;
            default:
                return null;
        }
    }

    const mapped = sessions.map((session) => {
        return {
            ...session,
            timestamp: decodeTime(session._id),
        };
    });

    mapped.sort((a, b) => b.timestamp - a.timestamp);
    const id = mapped.findIndex((x) => x._id === deviceId);

    const render = [
        mapped[id],
        ...mapped.slice(0, id),
        ...mapped.slice(id + 1, mapped.length),
    ];

    return (
        <div className={styles.sessions}>
            <h3>
                <Text id="app.settings.pages.sessions.active_sessions" />
            </h3>
            {render.map((session) => {
                const systemIcon = getSystemIcon(session);
                return (
                    <div
                        key={session._id}
                        className={styles.entry}
                        data-active={session._id === deviceId}
                        data-deleting={
                            attemptingDelete.indexOf(session._id) > -1
                        }>
                        {deviceId === session._id && (
                            <span className={styles.label}>
                                <Text id="app.settings.pages.sessions.this_device" />{" "}
                            </span>
                        )}
                        <div className={styles.session}>
                            <div className={styles.detail}>
                                <svg width={42} height={42} viewBox="0 0 32 32">
                                    <foreignObject
                                        x="0"
                                        y="0"
                                        width="32"
                                        height="32"
                                        mask={
                                            systemIcon
                                                ? "url(#session)"
                                                : undefined
                                        }>
                                        {getIcon(session)}
                                    </foreignObject>
                                    <foreignObject
                                        x="18"
                                        y="18"
                                        width="14"
                                        height="14">
                                        {systemIcon}
                                    </foreignObject>
                                </svg>
                                <div className={styles.info}>
                                    <input
                                        type="text"
                                        className={styles.name}
                                        value={session.name}
                                        autoComplete="off"
                                        style={{ pointerEvents: "none" }}
                                    />
                                    <span className={styles.time}>
                                        <Text
                                            id="app.settings.pages.sessions.created"
                                            fields={{
                                                time_ago: dayjs(
                                                    session.timestamp,
                                                ).fromNow(),
                                            }}
                                        />
                                    </span>
                                </div>
                            </div>
                            {deviceId !== session._id && (
                                <Button
                                    onClick={async () => {
                                        setDelete([
                                            ...attemptingDelete,
                                            session._id,
                                        ]);
                                        await client.api.delete(
                                            `/auth/session/${
                                                session._id as ""
                                            }`,
                                        );
                                        setSessions(
                                            sessions?.filter(
                                                (x) => x._id !== session._id,
                                            ),
                                        );
                                    }}
                                    disabled={
                                        attemptingDelete.indexOf(session._id) >
                                        -1
                                    }>
                                    <Text id="app.settings.pages.logOut" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
            <hr />
            <CategoryButton
                onClick={async () =>
                    modalController.push({
                        type: "sign_out_sessions",
                        client,
                        onDeleting: () =>
                            setDelete(
                                render
                                    .filter((x) => x._id !== deviceId)
                                    .map((x) => x._id),
                            ),
                        onDelete: () =>
                            setSessions(
                                sessions.filter((x) => x._id === deviceId),
                            ),
                    })
                }
                icon={<LogOut size={24} color={"var(--error)"} />}
                action={"chevron"}
                description={
                    "Logs you out of all sessions except this device."
                }>
                <Text id="app.settings.pages.sessions.logout" />
            </CategoryButton>

            <LineDivider />
            <Tip>
                <span>
                    <Text id="app.settings.tips.sessions.a" />{" "}
                    <a onClick={() => switchPage("account")}>
                        <Text id="app.settings.tips.sessions.b" />
                    </a>
                </span>
            </Tip>
        </div>
    );
}
