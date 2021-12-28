import { Wrench } from "@styled-icons/boxicons-solid";

import { useContext, useEffect, useState } from "preact/hooks";

import PaintCounter from "../../lib/PaintCounter";
import { TextReact } from "../../lib/i18n";

import { AppContext } from "../../context/revoltjs/RevoltClient";

import Header, { PageHeader } from "../../components/ui/Header";

export default function Developer() {
    // const voice = useContext(VoiceContext);

    const client = useContext(AppContext);
    const userPermission = client.user!.permission;
    const [ping, setPing] = useState<undefined | number>(client.websocket.ping);
    const [crash, setCrash] = useState(false);

    useEffect(() => {
        const timer = setInterval(
            () => setPing(client.websocket.ping),
            client.options.heartbeat * 1e3,
        );

        return () => clearInterval(timer);
    }, []);

    return (
        <div>
            <PageHeader icon={<Wrench size="24" />}>Developer Tab</PageHeader>
            <div style={{ padding: "16px", paddingTop: "56px" }}>
                <PaintCounter always />
            </div>
            <div style={{ padding: "16px" }}>
                <b>Server Ping:</b> {ping ?? "?"}ms
                <br />
                <b>User ID:</b> {client.user!._id} <br />
                <b>Permission against self:</b> {userPermission} <br />
            </div>
            <div style={{ padding: "16px" }}>
                <TextReact
                    id="login.open_mail_provider"
                    fields={{ provider: <b>GAMING!</b> }}
                />
            </div>
            <div style={{ padding: "16px" }}>
                <a onClick={() => setCrash(true)}>click to crash app</a>
                {crash && (window as any).sus.sus()}
                {/*<span>
                    <b>Voice Status:</b> {VoiceStatus[voice.status]}
                </span>
                <br />
                <span>
                    <b>Voice Room ID:</b> {voice.roomId || "undefined"}
                </span>
                <br />
                <span>
                    <b>Voice Participants:</b> [
                    {Array.from(voice.participants.keys()).join(", ")}]
                </span>
                <br />*/}
            </div>
        </div>
    );
}
