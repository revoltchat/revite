import { User } from "revolt.js";
import UserIcon from "./UserIcon";
import { Text } from "preact-i18n";

export function Username({ user, ...otherProps }: { user?: User } & JSX.HTMLAttributes<HTMLElement>) {
    return <b {...otherProps}>{ user?.username ?? <Text id="app.main.channel.unknown_user" /> }</b>;
}

export default function UserShort({ user, size }: { user?: User, size?: number }) {
    return <>
        <UserIcon size={size ?? 24} target={user} />
        <Username user={user} />
    </>;
}
