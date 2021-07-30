import { observer } from "mobx-react-lite";
import { User } from "revolt.js/dist/maps/Users";

import { Text } from "preact-i18n";

import UserIcon from "./UserIcon";

export const Username = observer(
    ({
        user,
        ...otherProps
    }: { user?: User } & JSX.HTMLAttributes<HTMLElement>) => {
        let username = user?.username;
        let color;

        /* // ! FIXME: this must be really bad for perf.
        if (user) {
            let { server } = useParams<{ server?: string }>();
            if (server) {
                let ctx = useForceUpdate();
                let member = useMember(`${server}${user._id}`, ctx);
                if (member) {
                    if (member.nickname) {
                        username = member.nickname;
                    }

                    if (member.roles && member.roles.length > 0) {
                        let s = useServer(server, ctx);
                        for (let role of member.roles) {
                            let c = s?.roles?.[role].colour;
                            if (c) {
                                color = c;
                                continue;
                            }
                        }
                    }
                }
            }
        } */

        return (
            <span {...otherProps} style={{ color }}>
                {username ?? <Text id="app.main.channel.unknown_user" />}
            </span>
        );
    },
);

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
