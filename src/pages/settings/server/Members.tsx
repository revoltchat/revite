import { useEffect, useState } from "preact/hooks";
import { Servers } from "revolt.js/dist/api/objects";
import Checkbox from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";
import { useForceUpdate, useUsers } from "../../../context/revoltjs/hooks";

interface Props {
    server: Servers.Server;
}

// ! FIXME: bad code :)
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
            <Tip warning>This section is under construction.</Tip>
            { members && members.length > 0 && users?.map(x => x && <div>
                <br/>
                <br/>
                <br/>

                <span>@{x.username}</span>
                { server.roles && Object.keys(server.roles).map(id => {
                    let role = server.roles?.[id]!;
                    let member = members.find(y => x._id === y._id.user)!;

                    return (
                        <Checkbox checked={member.roles?.includes(id) ?? false} onChange={selected => {
                            let roles = (member.roles ?? []).filter(z => z !== id);
                            if (selected) roles.push(id);

                            ctx.client.servers.members.editMember(server._id, x._id, { roles });
                            setMembers(
                                [
                                    ...members.filter(e => e._id.user !== x._id),
                                    {
                                        ...member,
                                        roles
                                    }
                                ]
                            );
                        }}>{ role.name }</Checkbox>
                    )
                }) }
            </div>) }
        </div>
    );
}
