import { Wrench } from "@styled-icons/boxicons-solid";

import { useContext } from "preact/hooks";

import PaintCounter from "../../lib/PaintCounter";
import { TextReact } from "../../lib/i18n";

import { AppContext } from "../../context/revoltjs/RevoltClient";

import Header from "../../components/ui/Header";

export default function Developer() {
    // const voice = useContext(VoiceContext);
    const client = useContext(AppContext);
    const userPermission = client.user!.permission;

    return (
        <div>
            <Header placement="primary" padding={true}>
                <Wrench size="24" />
                Developer Tab
            </Header>
            <div style={{ padding: "16px" }}>
                <PaintCounter always />
            </div>
            <div style={{ padding: "16px" }}>
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
