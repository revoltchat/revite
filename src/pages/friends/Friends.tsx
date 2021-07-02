import { Friend } from "./Friend";
import { Text } from "preact-i18n";
import styles from "./Friend.module.scss";
import Header from "../../components/ui/Header";
import Overline from "../../components/ui/Overline";
import Tooltip from "../../components/common/Tooltip";
import IconButton from "../../components/ui/IconButton";
import { useUsers } from "../../context/revoltjs/hooks";
import { User, Users } from "revolt.js/dist/api/objects";
import UserIcon from "../../components/common/user/UserIcon";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";
import { useIntermediate } from "../../context/intermediate/Intermediate";
import { ChevronDown, ChevronRight } from "@styled-icons/boxicons-regular";
import { UserDetail, Conversation, UserPlus } from "@styled-icons/boxicons-solid";

export default function Friends() {
    const { openScreen } = useIntermediate();

    const users = useUsers() as User[];
    users.sort((a, b) => a.username.localeCompare(b.username));

    const friends = users.filter(x => x.relationship === Users.Relationship.Friend);

    const lists = [
        [ 'app.special.friends.pending', users.filter(x =>
            x.relationship === Users.Relationship.Incoming
        ) ],
        [ 'app.special.friends.pending', users.filter(x =>
            x.relationship === Users.Relationship.Outgoing
        ) ],
        [ 'app.status.online', friends.filter(x =>
            x.online && x.status?.presence !== Users.Presence.Invisible
        ) ],
        [ 'app.status.offline', friends.filter(x =>
            !x.online || x.status?.presence === Users.Presence.Invisible
        ) ],
        [ 'app.special.friends.blocked', friends.filter(x =>
            x.relationship === Users.Relationship.Blocked
        ) ]
    ] as [ string, User[] ][];

    const isEmpty = lists.reduce((p: number, n) => p + n.length, 0) === 0;
    return (
        <>
            <Header placement="primary">
                { !isTouchscreenDevice && <UserDetail size={24} /> }
                <div className={styles.title}>
                    <Text id="app.navigation.tabs.friends" />
                </div>
                <Tooltip content={"Create Group"} placement="bottom">
                    <IconButton onClick={() => openScreen({ id: 'special_input', type: 'create_group' })}>
                        <Conversation size={24} />
                    </IconButton>
                </Tooltip>
                <Tooltip content={"Add Friend"} placement="bottom">
                    <IconButton onClick={() => openScreen({ id: 'special_input', type: 'add_friend' })}>
                        <UserPlus size={24} />
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
            </Header>
            <div className={styles.list} data-empty={isEmpty}>
                {isEmpty && (
                    <>
                        <img src="https://img.insrt.uk/xexu7/XOPoBUTI47.png/raw" />
                        <Text id="app.special.friends.nobody" />
                    </>
                )}

                { lists[0][1].length > 0 && <div className={styles.pending}
                    onClick={() => openScreen({ id: 'pending_requests', users: lists[0][1].map(x => x._id) })}>
                    <div className={styles.avatars}>
                        { lists[0][1].map((x, i) => i < 3 && <UserIcon target={x} size={64} />) }
                    </div>
                    <div className={styles.details}>
                        {/* ! FIXME: i18n */}
                        <div>Pending requests <span>{ lists[0][1].length }</span></div>
                        <span>From { lists[0][1].map(x => x.username).join(', ') }</span>
                    </div>
                    <ChevronRight size={48} />
                </div> }

                {
                    lists.map(([i18n, list], index) => {
                        if (index === 0) return;
                        if (list.length === 0) return;

                        return (
                            <details open>
                                <summary>
                                    <Overline className={styles.overline} type="subtle">
                                        <ChevronDown size={20} />
                                        <Text id={i18n} /> — { list.length }
                                    </Overline>
                                </summary>
                                { list.map(x => <Friend key={x._id} user={x} />) }
                            </details>
                        )
                    })
                }
            </div>
        </>
    );
}
