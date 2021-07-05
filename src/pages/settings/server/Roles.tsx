import { Text } from "preact-i18n";
import styles from './Panes.module.scss';
import Button from "../../../components/ui/Button";
import Overline from "../../../components/ui/Overline";
import { Servers } from "revolt.js/dist/api/objects";
import Checkbox from "../../../components/ui/Checkbox";
import { useContext, useEffect, useState } from "preact/hooks";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { ChannelPermission, ServerPermission } from "revolt.js/dist/api/permissions";
import Tip from "../../../components/ui/Tip";
import IconButton from "../../../components/ui/IconButton";
import ButtonItem from "../../../components/navigation/items/ButtonItem";
import isEqual from 'lodash.isequal';
import InputBox from "../../../components/ui/InputBox";
import { Plus } from "@styled-icons/boxicons-regular";
import { useIntermediate } from "../../../context/intermediate/Intermediate";

interface Props {
    server: Servers.Server;
}

const I32ToU32 = (arr: number[]) => arr.map(x => x >>> 0);

// ! FIXME: bad code :)
export function Roles({ server }: Props) {
    const [ role, setRole ] = useState('default');
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);
    const roles = server.roles ?? {};

    if (role !== 'default' && typeof roles[role] === 'undefined') {
        useEffect(() => setRole('default'));
        return <></>;
    }

    const v = (id: string) => I32ToU32(id === 'default' ? server.default_permissions : roles[id].permissions)
    const [ perm, setPerm ] = useState(v(role));
    useEffect(() => setPerm(v(role)), [ role, roles[role]?.permissions ]);

    const modified = !isEqual(perm, v(role));
    const save = () => client.servers.setPermissions(server._id, role, { server: perm[0], channel: perm[1] });
    const deleteRole = () => {
        setRole('default');
        client.servers.deleteRole(server._id, role);
    };
    
    return (
        <div className={styles.roles}>
            <div className={styles.list}>
                <div className={styles.title}>
                    <h1><Text id="app.settings.server_pages.roles.title" /></h1>
                    <Plus size={22} onClick={() =>
                        openScreen({ id: 'special_input', type: 'create_role', server: server._id, callback: id => setRole(id) })} />
                </div>
                { [ 'default', ...Object.keys(roles) ]
                    .map(id => {
                        if (id === 'default') {
                            return (
                                <ButtonItem active={role === 'default'} onClick={() => setRole('default')}>
                                    <Text id="app.settings.permissions.default_role" />
                                </ButtonItem>
                            )
                        } else {
                            return (
                                <ButtonItem active={role === id} onClick={() => setRole(id)}>
                                    { roles[id].name }
                                </ButtonItem>
                            )
                        }
                    })
                }
            </div>
            <div className={styles.permissions}>
                <div className={styles.title}>
                    <h2>{ role === 'default' ? <Text id="app.settings.permissions.default_role" /> : roles[role].name }</h2>
                    <Button contrast disabled={!modified} onClick={save}>Save</Button>
                </div>
                <section>
                    <Overline type="subtle"><Text id="app.settings.permissions.server" /></Overline>
                    { Object.keys(ServerPermission)
                        .map(key => {
                            if (key === 'View') return;
                            let value = ServerPermission[key as keyof typeof ServerPermission];

                            return (
                                <Checkbox checked={(perm[0] & value) > 0}
                                    onChange={() => setPerm([ perm[0] ^ value, perm[1] ])}
                                    description={<Text id={`permissions.server.${key}.d`} />}>
                                    <Text id={`permissions.server.${key}.t`} />
                                </Checkbox>
                            )
                        })
                    }
                </section>
                <section>
                    <Overline type="subtle"><Text id="app.settings.permissions.channel" /></Overline>
                    { Object.keys(ChannelPermission)
                        .map(key => {
                            if (key === 'ManageChannel') return;
                            let value = ChannelPermission[key as keyof typeof ChannelPermission];

                            return (
                                <Checkbox checked={((perm[1] >>> 0) & value) > 0}
                                    onChange={() => setPerm([ perm[0], perm[1] ^ value ])}
                                    disabled={key === 'View'}
                                    description={<Text id={`permissions.channel.${key}.d`} />}>
                                    <Text id={`permissions.channel.${key}.t`} />
                                </Checkbox>
                            )
                        })
                    }
                </section>
                <div className={styles.actions}>
                    <Button contrast disabled={!modified} onClick={save}>Save</Button>
                    { role !== 'default' && <Button contrast error onClick={deleteRole}>Delete</Button> }
                </div>
            </div>
        </div>
    );
}
