import { observer } from "mobx-react-lite";
import { User, API } from "revolt.js";

import { Text } from "preact-i18n";

import Tooltip from "../Tooltip";

interface Props {
    user?: User;
    tooltip?: boolean;
}

export default observer(({ user, tooltip }: Props) => {
    if (user?.online) {
        if (user.status?.text) {
            if (tooltip) {
                return (
                    <Tooltip arrow={undefined} content={user.status.text}>
                        {user.status.text}
                    </Tooltip>
                );
            }

            return <>{user.status.text}</>;
        }

        if (user.status?.presence === "Busy") {
            return <Text id="app.status.busy" />;
        }

        if (user.status?.presence === "Idle") {
            return <Text id="app.status.idle" />;
        }

        if (user.status?.presence === "Focus") {
            return <Text id="app.status.focus" />;
        }

        if (user.status?.presence === "Invisible") {
            return <Text id="app.status.offline" />;
        }

        return <Text id="app.status.online" />;
    }

    return <Text id="app.status.offline" />;
});
