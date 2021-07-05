import {
    ChevronDown,
    ChevronRight,
    ListPlus,
} from "@styled-icons/boxicons-regular";
import { UserDetail, MessageAdd, UserPlus } from "@styled-icons/boxicons-solid";
import { User, Users } from "revolt.js/dist/api/objects";

import styles from "./Friend.module.scss";
import { Text } from "preact-i18n";

import { TextReact } from "../../lib/i18n";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useIntermediate } from "../../context/intermediate/Intermediate";
import { useUsers } from "../../context/revoltjs/hooks";

import CollapsibleSection from "../../components/common/CollapsibleSection";
import Tooltip from "../../components/common/Tooltip";
import UserIcon from "../../components/common/user/UserIcon";
import Details from "../../components/ui/Details";
import Header from "../../components/ui/Header";
import IconButton from "../../components/ui/IconButton";
import Overline from "../../components/ui/Overline";

import { Children } from "../../types/Preact";
import { Friend } from "./Friend";

export default function Friends() {
    const { openScreen } = useIntermediate();

    const users = useUsers() as User[];
    users.sort((a, b) => a.username.localeCompare(b.username));

    const friends = users.filter(
        (x) => x.relationship === Users.Relationship.Friend,
    );

    const lists = [
        [
            "",
            users.filter((x) => x.relationship === Users.Relationship.Incoming),
        ],
        [
            "app.special.friends.sent",
            users.filter((x) => x.relationship === Users.Relationship.Outgoing),
            "outgoing",
        ],
        [
            "app.status.online",
            friends.filter(
                (x) =>
                    x.online && x.status?.presence !== Users.Presence.Invisible,
            ),
            "online",
        ],
        [
            "app.status.offline",
            friends.filter(
                (x) =>
                    !x.online ||
                    x.status?.presence === Users.Presence.Invisible,
            ),
            "offline",
        ],
        [
            "app.special.friends.blocked",
            users.filter((x) => x.relationship === Users.Relationship.Blocked),
            "blocked",
        ],
    ] as [string, User[], string][];

    const incoming = lists[0][1];
    const userlist: Children[] = incoming.map((x) => <b>{x.username}</b>);
    for (let i = incoming.length - 1; i > 0; i--) userlist.splice(i, 0, ", ");

    const isEmpty = lists.reduce((p: number, n) => p + n.length, 0) === 0;
    return (
        <>
            <Header placement="primary">
                {!isTouchscreenDevice && <UserDetail size={24} />}
                <div className={styles.title}>
                    <Text id="app.navigation.tabs.friends" />
                </div>
                <div className={styles.actions}>
                    {/*<Tooltip content={"Create Category"} placement="bottom">
                        <IconButton onClick={() => openScreen({ id: 'special_input', type: 'create_group' })}>
                            <ListPlus size={28} />
                        </IconButton>
                    </Tooltip>
                    <div className={styles.divider} />*/}
                    <Tooltip content={"Create Group"} placement="bottom">
                        <IconButton
                            onClick={() =>
                                openScreen({
                                    id: "special_input",
                                    type: "create_group",
                                })
                            }>
                            <MessageAdd size={24} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content={"Add Friend"} placement="bottom">
                        <IconButton
                            onClick={() =>
                                openScreen({
                                    id: "special_input",
                                    type: "add_friend",
                                })
                            }>
                            <UserPlus size={27} />
                        </IconButton>
                    </Tooltip>
                    {/* 
                    <div className={styles.divider} />
                    <Tooltip content={"Friend Activity"} placement="bottom">
                        <IconButton>
                            <TennisBall size={24} />
                        </IconButton>            
                    </Tooltip>
                    */}
                </div>
            </Header>
            <div className={styles.list} data-empty={isEmpty} data-mobile={isTouchscreenDevice}>
                {isEmpty && (
                    <>
                        <img src="https://img.insrt.uk/xexu7/XOPoBUTI47.png/raw" />
                        <Text id="app.special.friends.nobody" />
                    </>
                )}

                {incoming.length > 0 && (
                    <div
                        className={styles.pending}
                        onClick={() =>
                            openScreen({
                                id: "pending_requests",
                                users: incoming.map((x) => x._id),
                            })
                        }>
                        <div className={styles.avatars}>
                            {incoming.map(
                                (x, i) =>
                                    i < 3 && (
                                        <UserIcon
                                            target={x}
                                            size={64}
                                            mask={
                                                i <
                                                Math.min(incoming.length - 1, 2)
                                                    ? "url(#overlap)"
                                                    : undefined
                                            }
                                        />
                                    ),
                            )}
                        </div>
                        <div className={styles.details}>
                            <div>
                                <Text id="app.special.friends.pending" />{" "}
                                <span>{incoming.length}</span>
                            </div>
                            <span>
                                {incoming.length > 3 ? (
                                    <TextReact
                                        id="app.special.friends.from.several"
                                        fields={{
                                            userlist: userlist.slice(0, 6),
                                            count: incoming.length - 3,
                                        }}
                                    />
                                ) : incoming.length > 1 ? (
                                    <TextReact
                                        id="app.special.friends.from.multiple"
                                        fields={{
                                            user: userlist.shift()!,
                                            userlist: userlist.slice(1),
                                        }}
                                    />
                                ) : (
                                    <TextReact
                                        id="app.special.friends.from.single"
                                        fields={{ user: userlist[0] }}
                                    />
                                )}
                            </span>
                        </div>
                        <ChevronRight size={28} />
                    </div>
                )}

                {lists.map(([i18n, list, section_id], index) => {
                    if (index === 0) return;
                    if (list.length === 0) return;

                    return (
                        <CollapsibleSection
                            id={`friends_${section_id}`}
                            defaultValue={true}
                            sticky
                            large
                            summary={
                                <div class="title">
                                    <Text id={i18n} /> — {list.length}
                                </div>
                            }>
                            {list.map((x) => (
                                <Friend key={x._id} user={x} />
                            ))}
                        </CollapsibleSection>
                    );
                })}

<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><h1>test</h1>
            </div>
        </>
    );
}
