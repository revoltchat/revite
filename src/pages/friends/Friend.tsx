import { Text } from "preact-i18n";
import { Link } from "react-router-dom";
import styles from "./Friend.module.scss";
import { useContext } from "preact/hooks";
import { Children } from "../../types/Preact";
import { X, Plus } from "@styled-icons/boxicons-regular";
import { PhoneCall, Envelope } from "@styled-icons/boxicons-solid";
import IconButton from "../../components/ui/IconButton";
import { attachContextMenu } from "preact-context-menu";
import { User, Users } from "revolt.js/dist/api/objects";
import { stopPropagation } from "../../lib/stopPropagation";
import UserIcon from "../../components/common/user/UserIcon";
import UserStatus from '../../components/common/user/UserStatus';
import { AppContext } from "../../context/revoltjs/RevoltClient";
import { useIntermediate } from "../../context/intermediate/Intermediate";

interface Props {
    user: User;
}

export function Friend({ user }: Props) {
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();

    const actions: Children[] = [];
    let subtext: Children = null;

    if (user.relationship === Users.Relationship.Friend) {
        subtext = <UserStatus user={user} />
        actions.push(
            <>
            <IconButton type="circle"
                onClick={stopPropagation}>
                <Link to={'/open/' + user._id}>
                    <PhoneCall size={20} />
                </Link>
            </IconButton>
            <IconButton type="circle"
                onClick={stopPropagation}>
                <Link to={'/open/' + user._id}>
                    <Envelope size={20} />
                </Link>
            </IconButton>
            </>
        );
    }

    if (user.relationship === Users.Relationship.Incoming) {
        actions.push(
            <IconButton type="circle"
                onClick={ev => stopPropagation(ev, client.users.addFriend(user.username))}>
                <Plus size={24} />
            </IconButton>
        );

        subtext = <Text id="app.special.friends.incoming" />;
    }

    if (user.relationship === Users.Relationship.Outgoing) {
        subtext = <Text id="app.special.friends.outgoing" />;
    }

    if (
        user.relationship === Users.Relationship.Friend ||
        user.relationship === Users.Relationship.Outgoing ||
        user.relationship === Users.Relationship.Incoming
    ) {
        actions.push(
            <IconButton type="circle"
                onClick={ev => stopPropagation(ev, client.users.removeFriend(user._id))}>
                <X size={24} />
            </IconButton>
        );
    }

    if (user.relationship === Users.Relationship.Blocked) {
        actions.push(
            <IconButton type="circle"
                onClick={ev => stopPropagation(ev, client.users.unblockUser(user._id))}>
                <X size={24} />
            </IconButton>
        );
    }

    return (
        <div className={styles.friend}
            onClick={() => openScreen({ id: 'profile', user_id: user._id })}
            onContextMenu={attachContextMenu('Menu', { user: user._id })}>
            <UserIcon target={user} size={38} status />
            <div className={styles.name}>
                <span>@{user.username}</span>
                {subtext && (
                    <span className={styles.subtext}>{subtext}</span>
                )}
            </div>
            <div className={styles.actions}>{actions}</div>
        </div>
    );
}
