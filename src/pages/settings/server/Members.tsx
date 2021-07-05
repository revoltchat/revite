import { Servers } from "revolt.js/dist/api/objects";

import styles from "./Panes.module.scss";
import { useEffect, useState } from "preact/hooks";

import { useForceUpdate, useUsers } from "../../../context/revoltjs/hooks";

interface Props {
	server: Servers.Server;
}

// ! FIXME: bad code :)
export function Members({ server }: Props) {
	const [members, setMembers] = useState<Servers.Member[] | undefined>(
		undefined,
	);

	const ctx = useForceUpdate();
	const users = useUsers(members?.map((x) => x._id.user) ?? [], ctx);

	useEffect(() => {
		ctx.client.servers.members
			.fetchMembers(server._id)
			.then((members) => setMembers(members));
	}, []);

	return (
		<div className={styles.members}>
			<div className={styles.subtitle}>
				{members?.length ?? 0} Members
			</div>
			{members &&
				members.length > 0 &&
				users?.map(
					(x) =>
						x && (
							<div className={styles.member}>
								<div>@{x.username}</div>
							</div>
						),
				)}
		</div>
	);
}
