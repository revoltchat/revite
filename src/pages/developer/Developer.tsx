import { Wrench } from "@styled-icons/boxicons-solid";
import { Channels } from "revolt.js/dist/api/objects";

import { useContext } from "preact/hooks";

import PaintCounter from "../../lib/PaintCounter";
import { TextReact } from "../../lib/i18n";

import { AppContext } from "../../context/revoltjs/RevoltClient";
import { useData, useUserPermission } from "../../context/revoltjs/hooks";

import Header from "../../components/ui/Header";

export default function Developer() {
    // const voice = useContext(VoiceContext);
    const client = useContext(AppContext);
    const userPermission = useUserPermission(client.user!._id);

    return (
        <div>
            <Header placement="primary">
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
            <DataTest />
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

function DataTest() {
    const channel_id = (
        useContext(AppContext)
            .channels.toArray()
            .find((x) => x.channel_type === "Group") as Channels.GroupChannel
    )._id;

    const data = useData(
        (client) => {
            return {
                name: (client.channels.get(channel_id) as Channels.GroupChannel)
                    .name,
            };
        },
        [{ key: "channels", id: channel_id }],
    );

    return (
        <div style={{ padding: "16px" }}>
            Channel name: {data.name}
            <div style={{ width: "24px" }}>
                <PaintCounter small />
            </div>
        </div>
    );
}
