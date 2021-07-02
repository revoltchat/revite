import styles from "./UserPicker.module.scss";
import { useUsers } from "../../revoltjs/hooks";
import Modal from "../../../components/ui/Modal";
import { Friend } from "../../../pages/friends/Friend";

interface Props {
    users: string[];
    onClose: () => void;
}

export function PendingRequests({ users: ids, onClose }: Props) {
    const users = useUsers(ids);

    return (
        <Modal
            visible={true}
            title={"Pending requests"}
            onClose={onClose}>
            <div className={styles.list}>
                { users
                    .filter(x => typeof x !== 'undefined')
                    .map(x => <Friend user={x!} key={x!._id} />) }
            </div>
        </Modal>
    );
}
