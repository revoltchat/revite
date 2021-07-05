import styles from "./UserPicker.module.scss";
import { Text } from "preact-i18n";

import Modal from "../../../components/ui/Modal";

import { Friend } from "../../../pages/friends/Friend";
import { useUsers } from "../../revoltjs/hooks";

interface Props {
	users: string[];
	onClose: () => void;
}

export function PendingRequests({ users: ids, onClose }: Props) {
	const users = useUsers(ids);

	return (
		<Modal
			visible={true}
			title={<Text id="app.special.friends.pending" />}
			onClose={onClose}>
			<div className={styles.list}>
				{users
					.filter((x) => typeof x !== "undefined")
					.map((x) => (
						<Friend user={x!} key={x!._id} />
					))}
			</div>
		</Modal>
	);
}
