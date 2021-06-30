import { useEffect, useState } from "preact/hooks";
import Button from "../../../components/ui/Button";
import { Servers } from "revolt.js/dist/api/objects";
import Checkbox from "../../../components/ui/Checkbox";
import { ServerPermission } from "revolt.js/dist/api/permissions";

interface Props {
    server: Servers.Server;
}

export function Roles({ server }: Props) {
    const [ selected, setSelected ] = useState('default');

    const roles = server.roles ?? {};
    const keys = [ 'default', ...Object.keys(roles) ];

    const defaultRole = { name: 'Default', permissions: server.default_permissions };
    const selectedRole: Servers.Role = selected === 'default' ? defaultRole : roles[selected];

    if (!selectedRole) {
        useEffect(() => setSelected('default'), [ ]);
        return null;
    }
    
    return (
        <div>
            <h2>select role</h2>
            { keys
                .map(id => {
                    let role: Servers.Role = id === 'default' ? defaultRole : roles[id];

                    return (
                        <Checkbox checked={selected === id} onChange={selected => selected && setSelected(id)}>
                            { role.name }
                        </Checkbox>
                    )
                })
            }
            <Button disabled={selected === 'default'} error onClick={() => {}}>delete role</Button>
            <h2>permmissions</h2>
            { Object.keys(ServerPermission)
                .map(perm => {
                    let value = ServerPermission[perm as keyof typeof ServerPermission];

                    return (
                        <Checkbox checked={(selectedRole.permissions[0] & value) > 0} onChange={() => {}}>
                            { perm }
                        </Checkbox>
                    )
                })
            }
        </div>
    );
}
