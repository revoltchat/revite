import { Text } from "preact-i18n";
import styles from './Panes.module.scss';
import Button from "../../../components/ui/Button";
import { Servers } from "revolt.js/dist/api/objects";
import InputBox from "../../../components/ui/InputBox";
import Checkbox from "../../../components/ui/Checkbox";
import { useContext, useEffect, useState } from "preact/hooks";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { ChannelPermission, ServerPermission } from "revolt.js/dist/api/permissions";
import Tip from "../../../components/ui/Tip";

interface Props {
    server: Servers.Server;
}

// ! FIXME: bad code :)
export function Roles({ server }: Props) {
    const [ selected, setSelected ] = useState('default');
    const client = useContext(AppContext);

    const roles = server.roles ?? {};
    const keys = [ 'default', ...Object.keys(roles) ];

    const defaultRole = { name: 'Default', permissions: server.default_permissions };
    const selectedRole: Servers.Role = selected === 'default' ? defaultRole : roles[selected];

    if (!selectedRole) {
        useEffect(() => setSelected('default'), [ ]);
        return null;
    }

    const [ p, setPerm ] = useState([
        selectedRole.permissions[0] >>> 0,
        selectedRole.permissions[1] >>> 0,
    ]);

    useEffect(() => {
        setPerm([
            selectedRole.permissions[0] >>> 0,
            selectedRole.permissions[1] >>> 0,
        ]);
    }, [ selected, selectedRole.permissions ]);

    const [ name, setName ] = useState('');
    
    return (
        <div className={styles.roles}>
            <Tip warning>This section is under construction.</Tip>
            <div className={styles.list}>
                <h1><Text id="app.settings.server_pages.roles.title" /></h1>
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
                <Button disabled={selected === 'default'} error onClick={() => {
                    setSelected('default');
                    client.servers.deleteRole(server._id, selected);
                }}>delete role</Button><br/>
                <InputBox placeholder="role name" value={name} onChange={e => setName(e.currentTarget.value)} />
                <Button contrast onClick={() => {
                    client.servers.createRole(server._id, name);
                }}>create</Button>
            </div>
            <div className={styles.permissions}>
                <h2>{ selectedRole.name }</h2>
                { Object.keys(ServerPermission)
                    .map(perm => {
                        let value = ServerPermission[perm as keyof typeof ServerPermission];

                        return (
                            <Checkbox checked={(p[0] & value) > 0} onChange={c => setPerm([ c ? (p[0] | value) : (p[0] ^ value), p[1] ])}>
                                { perm }
                            </Checkbox>
                        )
                    })
                }
                <h2>channel permmissions</h2>
                { Object.keys(ChannelPermission)
                    .map(perm => {
                        let value = ChannelPermission[perm as keyof typeof ChannelPermission];

                        return (
                            <Checkbox checked={((p[1] >>> 0) & value) > 0} onChange={c => setPerm([ p[0], c ? (p[1] | value) : (p[1] ^ value) ])}>
                                { perm }
                            </Checkbox>
                        )
                    })
                }
                <Button contrast onClick={() => {
                    client.servers.setPermissions(server._id, selected, { server: p[0], channel: p[1] });
                }}>click here to save permissions for role</Button>
            </div>
        </div>
    );
}
