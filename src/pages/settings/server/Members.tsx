import { ChevronDown } from "@styled-icons/boxicons-regular";
import { isEqual } from "lodash";
import { observer } from "mobx-react-lite";
import { Member } from "revolt.js/dist/maps/Members";
import { Server } from "revolt.js/dist/maps/Servers";
import { User } from "revolt.js/dist/maps/Users";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import UserIcon from "../../../components/common/user/UserIcon";
import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import IconButton from "../../../components/ui/IconButton";
import Overline from "../../../components/ui/Overline";

interface Props {
    server: Server;
}

export const Members = observer(({ server }: Props) => {
    const [selected, setSelected] = useState<undefined | string>();
    const [data, setData] = useState<
        { members: Member[]; users: User[] } | undefined
    >(undefined);

    useEffect(() => {
        server.fetchMembers().then(setData);
    }, [server, setData]);

    const [roles, setRoles] = useState<string[]>([]);
    useEffect(() => {
        if (selected) {
            setRoles(
                data!.members.find((x) => x._id.user === selected)?.roles ?? [],
            );
        }
    }, [setRoles, selected, data]);

    return (
        <div className={styles.userList}>
            <div className={styles.subtitle}>
                {data?.members.length ?? 0} Members
            </div>
            {data &&
                data.members.length > 0 &&
                data.members
                    .map((member) => {
                        return {
                            member,
                            user: data.users.find(
                                (x) => x._id === member._id.user,
                            ),
                        };
                    })
                    .map(({ member, user }) => (
                        // @ts-expect-error brokey
                        // eslint-disable-next-line react/jsx-no-undef
                        <Fragment key={member._id.user}>
                            <div
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
                                    key={`drop_${member._id.user}`}
                                    className={styles.memberView}>
                                    <Overline type="subtle">Roles</Overline>
                                    {Object.keys(server.roles ?? {}).map(
                                        (key) => {
                                            const role = server.roles![key];
                                            return (
                                                <Checkbox
                                                    key={key}
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
                                        onClick={() =>
                                            member.edit({
                                                roles,
                                            })
                                        }>
                                        <Text id="app.special.modals.actions.save" />
                                    </Button>
                                </div>
                            )}
                        </Fragment>
                    ))}
        </div>
    );
});
