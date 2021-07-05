import { User } from "revolt.js";
import { Users } from "revolt.js/dist/api/objects";

import { Text } from "preact-i18n";

interface Props {
	user: User;
}

export default function UserStatus({ user }: Props) {
	if (user.online) {
		if (user.status?.text) {
			return <>{user.status?.text}</>;
		}

		if (user.status?.presence === Users.Presence.Busy) {
			return <Text id="app.status.busy" />;
		}

		if (user.status?.presence === Users.Presence.Idle) {
			return <Text id="app.status.idle" />;
		}

		if (user.status?.presence === Users.Presence.Invisible) {
			return <Text id="app.status.offline" />;
		}

		return <Text id="app.status.online" />;
	}

	return <Text id="app.status.offline" />;
}
