import { observer } from "mobx-react-lite";

import styles from "./UserPicker.module.scss";
import { Text } from "preact-i18n";

import { User } from "../../../mobx";

import Modal from "../../../components/ui/Modal";

import { Friend } from "../../../pages/friends/Friend";

interface Props {
    users: User[];
    onClose: () => void;
}

export const PendingRequests = observer(({ users, onClose }: Props) => {
    return (
        <Modal
            visible={true}
            title={<Text id="app.special.friends.pending" />}
            onClose={onClose}>
            <div className={styles.list}>
                {users.map((x) => (
                    <Friend user={x!} key={x!._id} />
                ))}
            </div>
        </Modal>
    );
});
