import { ChevronDown } from "@styled-icons/boxicons-regular";
import { isEqual } from "lodash";
import { observer } from "mobx-react-lite";
import { Servers } from "revolt.js/dist/api/objects";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { useData } from "../../../mobx/State";

import { useClient } from "../../../context/revoltjs/RevoltClient";

import UserIcon from "../../../components/common/user/UserIcon";
import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import IconButton from "../../../components/ui/IconButton";
import Overline from "../../../components/ui/Overline";

interface Props {
    server: Servers.Server;
}

export const Members = observer(({ server }: Props) => {
    const [selected, setSelected] = useState<undefined | string>();
    const [members, setMembers] = useState<Servers.Member[] | undefined>(
        undefined,
    );

    const store = useData();
    const client = useClient();
    const users = members?.map((member) => store.users.get(member._id.user));

    useEffect(() => {
        client.members
            .fetchMembers(server._id)
            .then((members) => setMembers(members));
    }, []);

    const [roles, setRoles] = useState<string[]>([]);
    useEffect(() => {
        if (selected) {
            setRoles(
                members!.find((x) => x._id.user === selected)?.roles ?? [],
            );
        }
    }, [selected]);

    return (
        <div className={styles.userList}>
            <div className={styles.subtitle}>
                {members?.length ?? 0} Members
            </div>
            {members &&
                members.length > 0 &&
                members
                    .map((member, index) => {
                        return {
                            member,
                            user: users![index],
                        };
                    })
                    .map(({ member, user }) => (
                        <>
                            <div
                                key={member._id.user}
                                className={styles.member}
                                data-open={selected === member._id.user}
                                onClick={() =>
                                    setSelected(
                                        selected === member._id.user
                                            ? undefined
                                            : member._id.user,
                                    )
                                }>
                                <span>
                                    <UserIcon target={user} size={24} />{" "}
                                    {user?.username ?? (
                                        <Text id="app.main.channel.unknown_user" />
                                    )}
                                </span>
                                <IconButton className={styles.chevron}>
                                    <ChevronDown size={24} />
                                </IconButton>
                            </div>
                            {selected === member._id.user && (
                                <div
                                    key={"drop_" + member._id.user}
                                    className={styles.memberView}>
                                    <Overline type="subtle">Roles</Overline>
                                    {Object.keys(server.roles ?? {}).map(
                                        (key) => {
                                            let role = server.roles![key];
                                            return (
                                                <Checkbox
                                                    checked={
                                                        roles.includes(key) ??
                                                        false
                                                    }
                                                    onChange={(v) => {
                                                        if (v) {
                                                            setRoles([
                                                                ...roles,
                                                                key,
                                                            ]);
                                                        } else {
                                                            setRoles(
                                                                roles.filter(
                                                                    (x) =>
                                                                        x !==
                                                                        key,
                                                                ),
                                                            );
                                                        }
                                                    }}>
                                                    <span
                                                        style={{
                                                            color: role.colour,
                                                        }}>
                                                        {role.name}
                                                    </span>
                                                </Checkbox>
                                            );
                                        },
                                    )}
                                    <Button
                                        compact
                                        disabled={isEqual(
                                            member.roles ?? [],
                                            roles,
                                        )}
                                        onClick={async () => {
                                            await client.members.editMember(
                                                server._id,
                                                member._id.user,
                                                {
                                                    roles,
                                                },
                                            );

                                            setMembers(
                                                members.map((x) =>
                                                    x._id.user ===
                                                    member._id.user
                                                        ? {
                                                              ...x,
                                                              roles,
                                                          }
                                                        : x,
                                                ),
                                            );
                                        }}>
                                        <Text id="app.special.modals.actions.save" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ))}
        </div>
    );
});
