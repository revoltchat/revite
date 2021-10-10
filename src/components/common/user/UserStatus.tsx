import { observer } from "mobx-react-lite";
import { Presence } from "revolt-api/types/Users";
import { User } from "revolt.js/dist/maps/Users";

import { Text } from "preact-i18n";

import Tooltip from "../Tooltip";

interface Props {
    user?: User;
    tooltip?: boolean;
    className?: string;
}

export default observer(({ user, tooltip, className }: Props) => {
    if (user?.online) {
        if (user.status?.text) {
            if (tooltip) {
                return (
                    <Tooltip
                        flex={false}
                        arrow={undefined}
                        content={user.status.text}
                        className={className}>
                        {user.status.text}
                    </Tooltip>
                );
            }

            return (
                <span style={{ display: "inline-block" }} className={className}>
                    {user.status.text}
                </span>
            );
        }

        if (user.status?.presence === Presence.Busy) {
            return <Text id="app.status.busy" />;
        }

        if (user.status?.presence === Presence.Idle) {
            return <Text id="app.status.idle" />;
        }

        if (user.status?.presence === Presence.Invisible) {
            return <Text id="app.status.offline" />;
        }

        return <Text id="app.status.online" />;
    }

    return <Text id="app.status.offline" />;
});
