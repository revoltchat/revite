import { User } from "revolt.js";
import UserIcon from "./UserIcon";
import { Text } from "preact-i18n";

export function Username({ user }: { user?: User }) {
    return <b>{ user?.username ?? <Text id="app.main.channel.unknown_user" /> }</b>;
}

export default function UserShort({ user }: { user?: User }) {
    return <>
        <UserIcon size={24} target={user} />
        <Username user={user} />
    </>;
}
