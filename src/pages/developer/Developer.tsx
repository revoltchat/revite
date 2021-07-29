import { Wrench } from "@styled-icons/boxicons-solid";
import { isObservable, isObservableProp } from "mobx";
import { observer } from "mobx-react-lite";
import { Channels } from "revolt.js/dist/api/objects";

import { useContext } from "preact/hooks";

import PaintCounter from "../../lib/PaintCounter";
import { TextReact } from "../../lib/i18n";

import { AppContext } from "../../context/revoltjs/RevoltClient";
import { useUserPermission } from "../../context/revoltjs/hooks";

import UserIcon from "../../components/common/user/UserIcon";
import Header from "../../components/ui/Header";

import { useData } from "../../mobx/State";

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
            <ObserverTest />
            <ObserverTest2 />
            <ObserverTest3 />
            <ObserverTest4 />
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

const ObserverTest = observer(() => {
    const client = useContext(AppContext);
    const store = useData();
    return (
        <div style={{ padding: "16px" }}>
            <p>
                username:{" "}
                {store.users.get(client.user!._id)?.username ?? "no user!"}
                <PaintCounter small />
            </p>
        </div>
    );
});

const ObserverTest2 = observer(() => {
    const client = useContext(AppContext);
    const store = useData();
    return (
        <div style={{ padding: "16px" }}>
            <p>
                status:{" "}
                {JSON.stringify(store.users.get(client.user!._id)?.status) ??
                    "none"}
                <PaintCounter small />
            </p>
        </div>
    );
});

const ObserverTest3 = observer(() => {
    const client = useContext(AppContext);
    const store = useData();
    return (
        <div style={{ padding: "16px" }}>
            <p>
                avatar{" "}
                <UserIcon
                    size={64}
                    attachment={
                        store.users.get(client.user!._id)?.avatar ?? undefined
                    }
                />
                <PaintCounter small />
            </p>
        </div>
    );
});

const ObserverTest4 = observer(() => {
    const client = useContext(AppContext);
    const store = useData();
    return (
        <div style={{ padding: "16px" }}>
            <p>
                status text:{" "}
                {JSON.stringify(
                    store.users.get(client.user!._id)?.status?.text,
                ) ?? "none"}
                <PaintCounter small />
            </p>
        </div>
    );
});
