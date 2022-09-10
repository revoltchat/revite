import { Wrench } from "@styled-icons/boxicons-solid";

import { useEffect, useState } from "preact/hooks";

import { Button } from "@revoltchat/ui";

import PaintCounter from "../../lib/PaintCounter";
import { TextReact } from "../../lib/i18n";

import { PageHeader } from "../../components/ui/Header";
import { useClient } from "../../controllers/client/ClientController";

export default function Developer() {
    // const voice = useContext(VoiceContext);

    const client = useClient();
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
            <div style={{ padding: "16px" }}>
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
                <Button palette="error" onClick={() => setCrash(true)}>
                    Click to crash app
                </Button>
                {
                    crash &&
                        (
                            window as any
                        ).sus.sus() /* this runs a function that doesn't exist */
                }
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
