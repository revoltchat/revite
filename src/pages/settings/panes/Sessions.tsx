import { Chrome, Android, Apple, Windows } from "@styled-icons/boxicons-logos";
import { HelpCircle, Desktop } from "@styled-icons/boxicons-regular";
import {
    Safari,
    Firefoxbrowser,
    Microsoftedge,
    Linux,
    Macos,
    Opera,
    Samsung,
} from "@styled-icons/simple-icons";
import relativeTime from "dayjs/plugin/relativeTime";
import { useHistory } from "react-router-dom";
import { decodeTime } from "ulid";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { dayjs } from "../../../context/Locale";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Button from "../../../components/ui/Button";
import Preloader from "../../../components/ui/Preloader";
import Tip from "../../../components/ui/Tip";

dayjs.extend(relativeTime);

interface Session {
    id: string;
    friendly_name: string;
}

export function Sessions() {
    const client = useContext(AppContext);
    const deviceId =
        typeof client.session === "object" ? client.session.id : undefined;

    const [sessions, setSessions] = useState<Session[] | undefined>(undefined);
    const [attemptingDelete, setDelete] = useState<string[]>([]);
    const history = useHistory();

    function switchPage(to: string) {
        history.replace(`/settings/${to}`);
    }

    useEffect(() => {
        client.req("GET", "/auth/sessions").then((data) => {
            data.sort(
                (a, b) =>
                    (b.id === deviceId ? 1 : 0) - (a.id === deviceId ? 1 : 0),
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

    function getIcon(session: Session) {
        const name = session.friendly_name;
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

    function getSystemIcon(session: Session) {
        const name = session.friendly_name;
        switch (true) {
            case /linux/i.test(name):
                return <Linux size={14} />;
            case /android/i.test(name):
                return <Android size={14} />;
            case /mac.*os/i.test(name):
                return <Macos size={14} />;
            case /ios/i.test(name):
                return <Apple size={14} />;
            case /windows/i.test(name):
                return <Windows size={14} />;
            default:
                return null;
        }
    }

    const mapped = sessions.map((session) => {
        return {
            ...session,
            timestamp: decodeTime(session.id),
        };
    });

    mapped.sort((a, b) => b.timestamp - a.timestamp);
    const id = mapped.findIndex((x) => x.id === deviceId);

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
                        key={session.id}
                        className={styles.entry}
                        data-active={session.id === deviceId}
                        data-deleting={
                            attemptingDelete.indexOf(session.id) > -1
                        }>
                        {deviceId === session.id && (
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
                                        value={session.friendly_name}
                                        autocomplete="off"
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
                            {deviceId !== session.id && (
                                <Button
                                    onClick={async () => {
                                        setDelete([
                                            ...attemptingDelete,
                                            session.id,
                                        ]);
                                        await client.req(
                                            "DELETE",
                                            `/auth/sessions/${session.id}` as "/auth/sessions",
                                        );
                                        setSessions(
                                            sessions?.filter(
                                                (x) => x.id !== session.id,
                                            ),
                                        );
                                    }}
                                    disabled={
                                        attemptingDelete.indexOf(session.id) >
                                        -1
                                    }>
                                    <Text id="app.settings.pages.logOut" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
            <Button
                error
                onClick={async () => {
                    // ! FIXME: add to rAuth
                    const del: string[] = [];
                    render.forEach((session) => {
                        if (deviceId !== session.id) {
                            del.push(session.id);
                        }
                    });

                    setDelete(del);

                    for (const id of del) {
                        await client.req(
                            "DELETE",
                            `/auth/sessions/${id}` as "/auth/sessions",
                        );
                    }

                    setSessions(sessions.filter((x) => x.id === deviceId));
                }}>
                <Text id="app.settings.pages.sessions.logout" />
            </Button>
            <Tip>
                <span>
                    <Text id="app.settings.tips.sessions.a" />
                </span>{" "}
                <a onClick={() => switchPage("account")}>
                    <Text id="app.settings.tips.sessions.b" />
                </a>
            </Tip>
        </div>
    );
}
