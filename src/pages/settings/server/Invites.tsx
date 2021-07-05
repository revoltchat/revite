import { XCircle } from "@styled-icons/boxicons-regular";
import { Invites as InvitesNS, Servers } from "revolt.js/dist/api/objects";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import {
	useChannels,
	useForceUpdate,
	useUsers,
} from "../../../context/revoltjs/hooks";
import { getChannelName } from "../../../context/revoltjs/util";

import UserIcon from "../../../components/common/user/UserIcon";
import IconButton from "../../../components/ui/IconButton";
import Preloader from "../../../components/ui/Preloader";

interface Props {
	server: Servers.Server;
}

export function Invites({ server }: Props) {
	const [invites, setInvites] = useState<
		InvitesNS.ServerInvite[] | undefined
	>(undefined);

	const ctx = useForceUpdate();
	const [deleting, setDelete] = useState<string[]>([]);
	const users = useUsers(invites?.map((x) => x.creator) ?? [], ctx);
	const channels = useChannels(invites?.map((x) => x.channel) ?? [], ctx);

	useEffect(() => {
		ctx.client.servers
			.fetchInvites(server._id)
			.then((invites) => setInvites(invites));
	}, []);

	return (
		<div className={styles.invites}>
			<div className={styles.subtitle}>
				<span>Invite Code</span>
				<span>Invitor</span>
				<span>Channel</span>
				<span>Revoke</span>
			</div>
			{typeof invites === "undefined" && <Preloader type="ring" />}
			{invites?.map((invite) => {
				let creator = users.find((x) => x?._id === invite.creator);
				let channel = channels.find((x) => x?._id === invite.channel);

				return (
					<div
						className={styles.invite}
						data-deleting={deleting.indexOf(invite._id) > -1}>
						<code>{invite._id}</code>
						<span>
							<UserIcon target={creator} size={24} />{" "}
							{creator?.username ?? "unknown"}
						</span>
						<span>
							{channel && creator
								? getChannelName(ctx.client, channel, true)
								: "#unknown"}
						</span>
						<IconButton
							onClick={async () => {
								setDelete([...deleting, invite._id]);

								await ctx.client.deleteInvite(invite._id);

								setInvites(
									invites?.filter(
										(x) => x._id !== invite._id,
									),
								);
							}}
							disabled={deleting.indexOf(invite._id) > -1}>
							<XCircle size={24} />
						</IconButton>
					</div>
				);
			})}
		</div>
	);
}
