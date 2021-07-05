import { Servers } from "revolt.js/dist/api/objects";

import { useContext, useEffect, useState } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Tip from "../../../components/ui/Tip";

interface Props {
	server: Servers.Server;
}

export function Bans({ server }: Props) {
	const client = useContext(AppContext);
	const [bans, setBans] = useState<Servers.Ban[] | undefined>(undefined);

	useEffect(() => {
		client.servers.fetchBans(server._id).then((bans) => setBans(bans));
	}, []);

	return (
		<div>
			<Tip warning>This section is under construction.</Tip>
			{bans?.map((x) => (
				<div>
					{x._id.user}: {x.reason ?? "no reason"}{" "}
					<button
						onClick={() =>
							client.servers.unbanUser(server._id, x._id.user)
						}>
						unban
					</button>
				</div>
			))}
		</div>
	);
}
