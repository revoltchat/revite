import { useEffect, useState } from "preact/hooks";
import { Servers } from "revolt.js/dist/api/objects";
import { useForceUpdate, useUsers } from "../../../context/revoltjs/hooks";

interface Props {
    server: Servers.Server;
}

export function Members({ server }: Props) {
    const [members, setMembers] = useState<Servers.Member[] | undefined>(undefined);
    const ctx = useForceUpdate();
    const users = useUsers(members?.map(x => x._id.user) ?? [], ctx);

    useEffect(() => {
        ctx.client.servers.members.fetchMembers(server._id)
            .then(members => setMembers(members))
    }, [ ]);

    return (
        <div>
            { members && members.length > 0 && users?.map(x => x && <div>@{x.username}</div>) }
        </div>
    );
}
