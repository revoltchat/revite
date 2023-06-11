import { X, Plus } from "@styled-icons/boxicons-regular";
import { PhoneCall, Envelope, UserX } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { User } from "revolt.js";

import styles from "./Friend.module.scss";
import classNames from "classnames";
import { useTriggerEvents } from "preact-context-menu";
import { Text } from "preact-i18n";

import { IconButton } from "@revoltchat/ui";

import { stopPropagation } from "../../lib/stopPropagation";
import { voiceState } from "../../lib/vortex/VoiceState";

import UserIcon from "../../components/common/user/UserIcon";
import UserStatus from "../../components/common/user/UserStatus";
import { modalController } from "../../controllers/modals/ModalController";

interface Props {
    user: User;
}

export const Friend = observer(({ user }: Props) => {
    const history = useHistory();

    const actions: Children[] = [];
    let subtext: Children = null;

    if (user.relationship === "Friend") {
        subtext = <UserStatus user={user} />;
        actions.push(
            <>
                <IconButton
                    shape="circle"
                    className={classNames(styles.button, styles.success)}
                    onClick={(ev) =>
                        stopPropagation(
                            ev,
                            user
                                .openDM()
                                .then(voiceState.connect)
                                .then((x) => history.push(`/channel/${x._id}`)),
                        )
                    }>
                    <PhoneCall size={20} />
                </IconButton>
                <IconButton
                    shape="circle"
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

    if (user.relationship === "Incoming") {
        actions.push(
            <IconButton
                shape="circle"
                className={styles.button}
                onClick={(ev) => stopPropagation(ev, user.addFriend())}>
                <Plus size={24} />
            </IconButton>,
        );

        subtext = <Text id="app.special.friends.incoming" />;
    }

    if (user.relationship === "Outgoing") {
        subtext = <Text id="app.special.friends.outgoing" />;
    }

    if (
        user.relationship === "Friend" ||
        user.relationship === "Outgoing" ||
        user.relationship === "Incoming"
    ) {
        actions.push(
            <IconButton
                shape="circle"
                className={classNames(
                    styles.button,
                    styles.remove,
                    styles.error,
                )}
                onClick={(ev) =>
                    stopPropagation(
                        ev,
                        user.relationship === "Friend"
                            ? modalController.push({
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

    if (user.relationship === "Blocked") {
        actions.push(
            <IconButton
                shape="circle"
                className={classNames(styles.button, styles.error)}
                onClick={(ev) => stopPropagation(ev, user.unblockUser())}>
                <UserX size={24} />
            </IconButton>,
        );
    }

    return (
        <div
            className={styles.friend}
            onClick={() =>
                modalController.push({
                    type: "user_profile",
                    user_id: user._id,
                })
            }
            {...useTriggerEvents("Menu", {
                user: user._id,
            })}>
            <UserIcon target={user} size={36} status />
            <div className={styles.name}>
                <span>{user.display_name ?? user.username}</span>
                {subtext && <span className={styles.subtext}>{subtext}</span>}
            </div>
            <div className={styles.actions}>{actions}</div>
        </div>
    );
});
