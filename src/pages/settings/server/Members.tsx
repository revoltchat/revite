import { ChevronDown } from "@styled-icons/boxicons-regular";
import { isEqual } from "lodash";
import { observer } from "mobx-react-lite";
import { Virtuoso } from "react-virtuoso";
import { Member } from "revolt.js";
import { Server } from "revolt.js";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useMemo, useState } from "preact/hooks";

import {
    Button,
    Category,
    Checkbox,
    IconButton,
    InputBox,
    Preloader,
} from "@revoltchat/ui";

import UserIcon from "../../../components/common/user/UserIcon";
import { Username } from "../../../components/common/user/UserShort";

interface InnerProps {
    member: Member;
}

const Inner = observer(({ member }: InnerProps) => {
    const [open, setOpen] = useState(false);
    const [roles, setRoles] = useState<string[]>(member.roles ?? []);

    useEffect(() => {
        setRoles(member.roles ?? []);
    }, [member.roles]);

    const server_roles = member.server?.roles ?? {};
    const user = member.user;
    return (
        <>
            <div
                className={styles.member}
                data-open={open}
                onClick={() => setOpen(!open)}>
                <span>
                    <UserIcon target={user} size={24} />{" "}
                    <Username user={member.user} showServerIdentity="both" />
                </span>
                <IconButton className={styles.chevron}>
                    <ChevronDown size={24} />
                </IconButton>
            </div>
            {open && (
                <div className={styles.memberView}>
                    <Category>Roles</Category>
                    {Object.keys(server_roles).map((key) => {
                        const role = server_roles[key];
                        return (
                            <Checkbox
                                key={key}
                                value={roles.includes(key) ?? false}
                                title={
                                    <span
                                        style={{
                                            color: role.colour!,
                                        }}>
                                        {role.name}
                                    </span>
                                }
                                onChange={(v) => {
                                    if (v) {
                                        setRoles([...roles, key]);
                                    } else {
                                        setRoles(
                                            roles.filter((x) => x !== key),
                                        );
                                    }
                                }}
                            />
                        );
                    })}
                    <Button
                        palette="secondary"
                        disabled={isEqual(member.roles ?? [], roles)}
                        onClick={() =>
                            member.edit({
                                roles,
                            })
                        }>
                        <Text id="app.special.modals.actions.save" />
                    </Button>
                </div>
            )}
        </>
    );
});

interface Props {
    server: Server;
}

export const Members = ({ server }: Props) => {
    const [data, setData] = useState<Member[] | undefined>(undefined);
    const [query, setQuery] = useState("");

    useEffect(() => {
        function fetch() {
            server
                .fetchMembers()
                .then((data) => data.members)
                .then(setData);
        }

        fetch();

        // Members may be invalidated if we stop receiving events
        // This is not very accurate, this should be tracked within
        // revolt.js so we know the true validity.
        let valid = true,
            invalidationTimer: number;

        function waitToInvalidate() {
            invalidationTimer = setTimeout(() => {
                valid = false;
            }, 15 * 60e3) as never; // 15 minutes
        }

        function cancelInvalidation() {
            if (!valid) {
                fetch();
                valid = true;
            }

            clearTimeout(invalidationTimer);
        }

        addEventListener("blur", waitToInvalidate);
        addEventListener("focus", cancelInvalidation);

        return () => {
            removeEventListener("blur", waitToInvalidate);
            removeEventListener("focus", cancelInvalidation);
        };
    }, [server, setData]);

    const members = useMemo(
        () =>
            query
                ? data?.filter((x) =>
                      x.user?.username
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                  )
                : data,
        [data, query],
    );

    return (
        <div className={styles.userList}>
            <InputBox
                placeholder="Search for a specific user..."
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                palette="secondary"
            />
            <div className={styles.subtitle}>{data?.length ?? 0} Members</div>
            {members ? (
                <div className={styles.virtual}>
                    <Virtuoso
                        totalCount={members.length}
                        itemContent={(index) => (
                            <Inner member={members[index]} />
                        )}
                    />
                </div>
            ) : (
                <Preloader type="ring" />
            )}
        </div>
    );
};
