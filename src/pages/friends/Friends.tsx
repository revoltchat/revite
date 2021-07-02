import styles from "./Friend.module.scss";
import { Conversation, UserPlus } from "@styled-icons/boxicons-solid";

import { Friend } from "./Friend";
import { Text } from "preact-i18n";
import Header from "../../components/ui/Header";
import Overline from "../../components/ui/Overline";
import IconButton from "../../components/ui/IconButton";
import { useUsers } from "../../context/revoltjs/hooks";
import { User, Users } from "revolt.js/dist/api/objects";
import { useIntermediate } from "../../context/intermediate/Intermediate";

export default function Friends() {
    const { openScreen } = useIntermediate();

    const users = useUsers() as User[];
    users.sort((a, b) => a.username.localeCompare(b.username));

    const pending = users.filter(
        x =>
            x.relationship === Users.Relationship.Incoming ||
            x.relationship === Users.Relationship.Outgoing
    );
    const friends = users.filter(
        x => x.relationship === Users.Relationship.Friend
    );
    const blocked = users.filter(
        x => x.relationship === Users.Relationship.Blocked
    );

    return (
        <>
            <Header placement="primary">
                <div className={styles.title}>
                    <Text id="app.navigation.tabs.friends" />
                </div>
                <IconButton onClick={() => openScreen({ id: 'special_input', type: 'add_friend' })}> {/* TOFIX: Make sure this opens the "Start Group DM" window on click */}
                    <Conversation size={24} />
                </IconButton>
                <IconButton onClick={() => openScreen({ id: 'special_input', type: 'add_friend' })}>
                    <UserPlus size={24} />
                </IconButton>
            </Header>
            <div
                className={styles.list}
                data-empty={
                    pending.length + friends.length + blocked.length === 0
                }
            >
                {pending.length + friends.length + blocked.length === 0 && (
                    <>
                        <img src="https://img.insrt.uk/xexu7/XOPoBUTI47.png/raw" />
                        <Text id="app.special.friends.nobody" />
                    </>
                )}
                {pending.length > 0 && (
                    <Overline className={styles.overline} type="subtle">
                        <Text id="app.special.friends.pending" /> —{" "}
                        {pending.length}
                    </Overline>
                )}
                {pending.map(y => (
                    <Friend key={y._id} user={y} />
                ))}
                {friends.length > 0 && (
                    <Overline className={styles.overline} type="subtle">
                        <Text id="app.navigation.tabs.friends" /> —{" "}
                        {friends.length}
                    </Overline>
                )}
                {friends.map(y => (
                    <Friend key={y._id} user={y} />
                ))}
                {blocked.length > 0 && (
                    <Overline className={styles.overline} type="subtle">
                        <Text id="app.special.friends.blocked" /> —{" "}
                        {blocked.length}
                    </Overline>
                )}
                {blocked.map(y => (
                    <Friend key={y._id} user={y} />
                ))}
            </div>
        </>
    );
}
