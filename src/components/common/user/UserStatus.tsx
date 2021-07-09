import { User } from "revolt.js";
import { Users } from "revolt.js/dist/api/objects";

import { Text } from "preact-i18n";
import Tooltip from "../Tooltip";

interface Props {
    user?: User;
    tooltip?: boolean;
}

export default function UserStatus({ user, tooltip }: Props) {
    if (user?.online) {
        if (user.status?.text) {
            if (tooltip) {
                return (
                    <Tooltip arrow={undefined} content={ user.status.text }>
                        { user.status.text }
                    </Tooltip>
                )
            }

            return <>{user.status.text}</>;
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
