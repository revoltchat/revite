import { User } from "revolt.js";

import { Text } from "preact-i18n";

import UserIcon from "./UserIcon";

export function Username({
	user,
	...otherProps
}: { user?: User } & JSX.HTMLAttributes<HTMLElement>) {
	return (
		<span {...otherProps}>
			{user?.username ?? <Text id="app.main.channel.unknown_user" />}
		</span>
	);
}

export default function UserShort({
	user,
	size,
}: {
	user?: User;
	size?: number;
}) {
	return (
		<>
			<UserIcon size={size ?? 24} target={user} />
			<Username user={user} />
		</>
	);
}
