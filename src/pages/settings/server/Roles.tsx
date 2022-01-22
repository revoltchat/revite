import { Plus } from "@styled-icons/boxicons-regular";
import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { ChannelPermission, ServerPermission } from "revolt.js";
import { Server } from "revolt.js/dist/maps/Servers";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "preact/hooks";

import { Button } from "@revoltchat/ui/lib/components/atoms/inputs/Button";
import { Checkbox } from "@revoltchat/ui/lib/components/atoms/inputs/Checkbox";
import { ColourSwatches } from "@revoltchat/ui/lib/components/atoms/inputs/ColourSwatches";
import { InputBox } from "@revoltchat/ui/lib/components/atoms/inputs/InputBox";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Overline from "../../../components/ui/Overline";

import ButtonItem from "../../../components/navigation/items/ButtonItem";

interface Props {
    server: Server;
}

const I32ToU32 = (arr: number[]) => arr.map((x) => x >>> 0);

// ! FIXME: bad code :)
export const Roles = observer(({ server }: Props) => {
    const client = useContext(AppContext);
    const [role, setRole] = useState("default");
    const { openScreen } = useIntermediate();
    const roles = server.roles || {};

    if (role !== "default" && typeof roles[role] === "undefined") {
        useEffect(() => setRole("default"), [role]);
        return null;
    }

    const clientPermissions = client.servers.get(server._id)!.permission;

    const {
        name: roleName,
        colour: roleColour,
        hoist: roleHoist,
        rank: roleRank,
        permissions,
    } = roles[role] ?? {};

    const getPermissions = useCallback(
        (id: string) => {
            return I32ToU32(
                id === "default"
                    ? server.default_permissions
                    : roles[id].permissions,
            );
        },
        [roles, server],
    );

    const [perm, setPerm] = useState(getPermissions(role));
    const [name, setName] = useState(roleName);
    const [hoist, setHoist] = useState(roleHoist);
    const [rank, setRank] = useState(roleRank);
    const [colour, setColour] = useState(roleColour);

    useEffect(
        () => setPerm(getPermissions(role)),
        [getPermissions, role, permissions],
    );

    useEffect(() => setName(roleName), [role, roleName]);
    useEffect(() => setHoist(roleHoist), [role, roleHoist]);
    useEffect(() => setRank(roleRank), [role, roleRank]);
    useEffect(() => setColour(roleColour), [role, roleColour]);

    const modified =
        !isEqual(perm, getPermissions(role)) ||
        !isEqual(name, roleName) ||
        !isEqual(colour, roleColour) ||
        !isEqual(hoist, roleHoist) ||
        !isEqual(rank, roleRank);

    const save = () => {
        if (!isEqual(perm, getPermissions(role))) {
            server.setPermissions(role, {
                server: perm[0],
                channel: perm[1],
            });
        }

        if (
            !isEqual(name, roleName) ||
            !isEqual(colour, roleColour) ||
            !isEqual(hoist, roleHoist) ||
            !isEqual(rank, roleRank)
        ) {
            server.editRole(role, { name, colour, hoist, rank });
        }
    };

    const deleteRole = () => {
        setRole("default");
        server.deleteRole(role);
    };

    return (
        <div className={styles.roles}>
            <div className={styles.list}>
                <div className={styles.title}>
                    <h1>
                        <Text id="app.settings.server_pages.roles.title" />
                    </h1>
                    <Plus
                        size={22}
                        onClick={() =>
                            openScreen({
                                id: "special_input",
                                type: "create_role",
                                server,
                                callback: (id) => setRole(id),
                            })
                        }
                    />
                </div>
                {["default", ...Object.keys(roles)].map((id) =>
                    id === "default" ? (
                        <ButtonItem
                            active={role === "default"}
                            onClick={() => setRole("default")}>
                            <Text id="app.settings.permissions.default_role" />
                        </ButtonItem>
                    ) : (
                        <ButtonItem
                            key={id}
                            active={role === id}
                            onClick={() => setRole(id)}
                            style={{
                                color: roles[id].colour,
                            }}>
                            {roles[id].name}
                        </ButtonItem>
                    ),
                )}
            </div>
            <div className={styles.permissions}>
                <div className={styles.title}>
                    <h2>
                        {role === "default" ? (
                            <Text id="app.settings.permissions.default_role" />
                        ) : (
                            roles[role].name
                        )}
                    </h2>
                    <Button
                        palette="secondary"
                        disabled={!modified}
                        onClick={save}>
                        Save
                    </Button>
                </div>
                {role !== "default" && (
                    <>
                        <section>
                            <Overline type="subtle">Role Name</Overline>
                            <p>
                                <InputBox
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.currentTarget.value)
                                    }
                                    palette="secondary"
                                />
                            </p>
                        </section>
                        <section>
                            <Overline type="subtle">Role Colour</Overline>
                            <p>
                                <ColourSwatches
                                    value={colour ?? "gray"}
                                    onChange={(value) => setColour(value)}
                                />
                            </p>
                        </section>
                        <section>
                            <Overline type="subtle">Role Options</Overline>
                            <p>
                                <Checkbox
                                    value={hoist ?? false}
                                    onChange={(v) => setHoist(v)}
                                    description="Display this role above others.">
                                    Hoist Role
                                </Checkbox>
                            </p>
                        </section>
                    </>
                )}
                <section>
                    <Overline type="subtle">
                        <Text id="app.settings.permissions.server" />
                    </Overline>
                    {Object.keys(ServerPermission).map((key) => {
                        if (key === "View") return;
                        const value =
                            ServerPermission[
                                key as keyof typeof ServerPermission
                            ];

                        return (
                            <Checkbox
                                key={key}
                                value={(perm[0] & value) > 0}
                                onChange={() =>
                                    setPerm([perm[0] ^ value, perm[1]])
                                }
                                disabled={!(clientPermissions & value)}
                                description={
                                    <Text id={`permissions.server.${key}.d`} />
                                }>
                                <Text id={`permissions.server.${key}.t`} />
                            </Checkbox>
                        );
                    })}
                </section>
                <section>
                    <Overline type="subtle">
                        <Text id="app.settings.permissions.channel" />
                    </Overline>
                    {Object.keys(ChannelPermission).map((key) => {
                        if (key === "ManageChannel") return;
                        const value =
                            ChannelPermission[
                                key as keyof typeof ChannelPermission
                            ];

                        return (
                            <Checkbox
                                key={key}
                                value={((perm[1] >>> 0) & value) > 0}
                                onChange={() =>
                                    setPerm([perm[0], perm[1] ^ value])
                                }
                                disabled={
                                    key === "View" ||
                                    !(clientPermissions & value)
                                }
                                description={
                                    <Text id={`permissions.channel.${key}.d`} />
                                }>
                                <Text id={`permissions.channel.${key}.t`} />
                            </Checkbox>
                        );
                    })}
                </section>
                <div className={styles.actions}>
                    <Button
                        palette="secondary"
                        disabled={!modified}
                        onClick={save}>
                        Save
                    </Button>
                    {role !== "default" && (
                        <Button palette="error" onClick={deleteRole}>
                            Delete
                        </Button>
                    )}
                </div>
                {role !== "default" && (
                    <>
                        <section>
                            <Overline type="subtle">
                                Experimental Role Ranking
                            </Overline>
                            <p>
                                <InputBox
                                    value={rank ?? 0}
                                    onChange={(e) =>
                                        setRank(parseInt(e.currentTarget.value))
                                    }
                                    palette="secondary"
                                />
                            </p>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
});
