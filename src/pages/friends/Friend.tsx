import { X, Plus } from "@styled-icons/boxicons-regular";
import { PhoneCall, Envelope, UserX } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { RelationshipStatus } from "revolt-api/types/Users";
import { User } from "revolt.js/dist/maps/Users";

import styles from "./Friend.module.scss";
import classNames from "classnames";
import { attachContextMenu } from "preact-context-menu";
import { Text } from "preact-i18n";
import { useContext } from "preact/hooks";

import { stopPropagation } from "../../lib/stopPropagation";

import { VoiceOperationsContext } from "../../context/Voice";
import { useIntermediate } from "../../context/intermediate/Intermediate";

import UserIcon from "../../components/common/user/UserIcon";
import UserStatus from "../../components/common/user/UserStatus";
import IconButton from "../../components/ui/IconButton";

import { Children } from "../../types/Preact";

interface Props {
    user: User;
}

export const Friend = observer(({ user }: Props) => {
    const history = useHistory();
    const { openScreen } = useIntermediate();
    const { connect } = useContext(VoiceOperationsContext);

    const actions: Children[] = [];
    let subtext: Children = null;

    if (user.relationship === RelationshipStatus.Friend) {
        subtext = <UserStatus user={user} />;
        actions.push(
            <>
                <IconButton
                    type="circle"
                    className={classNames(styles.button, styles.success)}
                    onClick={(ev) =>
                        stopPropagation(
                            ev,
                            user
                                .openDM()
                                .then(connect)
                                .then((x) => history.push(`/channel/${x._id}`)),
                        )
                    }>
                    <PhoneCall size={20} />
                </IconButton>
                <IconButton
                    type="circle"
                    className={styles.button}
                    onClick={(ev) =>
                        stopPropagation(
                            ev,
                            user
                                .openDM()
                                .then((channel) =>
                                    history.push(`/channel/${channel._id}`),
                                ),
                        )
                    }>
                    <Envelope size={20} />
                </IconButton>
            </>,
        );
    }

    if (user.relationship === RelationshipStatus.Incoming) {
        actions.push(
            <IconButton
                type="circle"
                className={styles.button}
                onClick={(ev) => stopPropagation(ev, user.addFriend())}>
                <Plus size={24} />
            </IconButton>,
        );

        subtext = <Text id="app.special.friends.incoming" />;
    }

    if (user.relationship === RelationshipStatus.Outgoing) {
        subtext = <Text id="app.special.friends.outgoing" />;
    }

    if (
        user.relationship === RelationshipStatus.Friend ||
        user.relationship === RelationshipStatus.Outgoing ||
        user.relationship === RelationshipStatus.Incoming
    ) {
        actions.push(
            <IconButton
                type="circle"
                className={classNames(
                    styles.button,
                    styles.remove,
                    styles.error,
                )}
                onClick={(ev) =>
                    stopPropagation(
                        ev,
                        user.relationship === RelationshipStatus.Friend
                            ? openScreen({
                                  id: "special_prompt",
                                  type: "unfriend_user",
                                  target: user,
                              })
                            : user.removeFriend(),
                    )
                }>
                <X size={24} />
            </IconButton>,
        );
    }

    if (user.relationship === RelationshipStatus.Blocked) {
        actions.push(
            <IconButton
                type="circle"
                className={classNames(styles.button, styles.error)}
                onClick={(ev) => stopPropagation(ev, user.unblockUser())}>
                <UserX size={24} />
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
});
