import { X, Plus } from "@styled-icons/boxicons-regular";
import { PhoneCall, Envelope } from "@styled-icons/boxicons-solid";
import { User, Users } from "revolt.js/dist/api/objects";

import styles from "./Friend.module.scss";
import classNames from "classnames";
import { attachContextMenu } from "preact-context-menu";
import { Text } from "preact-i18n";
import { useContext } from "preact/hooks";

import { stopPropagation } from "../../lib/stopPropagation";

import { VoiceOperationsContext } from "../../context/Voice";
import { useIntermediate } from "../../context/intermediate/Intermediate";
import {
    AppContext,
    OperationsContext,
} from "../../context/revoltjs/RevoltClient";

import UserIcon from "../../components/common/user/UserIcon";
import UserStatus from "../../components/common/user/UserStatus";
import IconButton from "../../components/ui/IconButton";

import { Children } from "../../types/Preact";

interface Props {
    user: User;
}

export function Friend({ user }: Props) {
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();
    const { openDM } = useContext(OperationsContext);
    const { connect } = useContext(VoiceOperationsContext);

    const actions: Children[] = [];
    let subtext: Children = null;

    if (user.relationship === Users.Relationship.Friend) {
        subtext = <UserStatus user={user} />;
        actions.push(
            <>
                <IconButton
                    type="circle"
                    className={classNames(
                        styles.button,
                        styles.call,
                        styles.success,
                    )}
                    onClick={(ev) =>
                        stopPropagation(ev, openDM(user._id).then(connect))
                    }>
                    <PhoneCall size={20} />
                </IconButton>
                <IconButton
                    type="circle"
                    className={styles.button}
                    onClick={(ev) => stopPropagation(ev, openDM(user._id))}>
                    <Envelope size={20} />
                </IconButton>
            </>,
        );
    }

    if (user.relationship === Users.Relationship.Incoming) {
        actions.push(
            <IconButton
                type="circle"
                className={styles.button}
                onClick={(ev) =>
                    stopPropagation(ev, client.users.addFriend(user.username))
                }>
                <Plus size={24} />
            </IconButton>,
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
            <IconButton
                type="circle"
                className={classNames(styles.button, styles.error)}
                onClick={(ev) =>
                    stopPropagation(
                        ev,
                        user.relationship === Users.Relationship.Friend
                            ? openScreen({
                                  id: "special_prompt",
                                  type: "unfriend_user",
                                  target: user,
                              })
                            : client.users.removeFriend(user._id),
                    )
                }>
                <X size={24} />
            </IconButton>,
        );
    }

    if (user.relationship === Users.Relationship.Blocked) {
        actions.push(
            <IconButton
                type="circle"
                className={classNames(styles.button, styles.error)}
                onClick={(ev) =>
                    stopPropagation(ev, client.users.unblockUser(user._id))
                }>
                <X size={24} />
            </IconButton>,
        );
    }

    return (
        <div
            className={styles.friend}
            onClick={() => openScreen({ id: "profile", user_id: user._id })}
            onContextMenu={attachContextMenu("Menu", { user: user._id })}>
            <UserIcon target={user} size={36} status />
            <div className={styles.name}>
                <span>{user.username}</span>
                {subtext && <span className={styles.subtext}>{subtext}</span>}
            </div>
            <div className={styles.actions}>{actions}</div>
        </div>
    );
}
