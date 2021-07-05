import { Channels } from "revolt.js/dist/api/objects";
import { ChannelPermission } from "revolt.js/dist/api/permissions";

import { useContext, useEffect, useState } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { useServer } from "../../../context/revoltjs/hooks";

import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";

// ! FIXME: export from revolt.js
const DEFAULT_PERMISSION_DM =
	ChannelPermission.View +
	ChannelPermission.SendMessage +
	ChannelPermission.ManageChannel +
	ChannelPermission.VoiceCall +
	ChannelPermission.InviteOthers +
	ChannelPermission.EmbedLinks +
	ChannelPermission.UploadFiles;

interface Props {
	channel:
		| Channels.GroupChannel
		| Channels.TextChannel
		| Channels.VoiceChannel;
}

// ! FIXME: bad code :)
export default function Permissions({ channel }: Props) {
	const [selected, setSelected] = useState("default");
	const client = useContext(AppContext);

	type R = { name: string; permissions: number };
	let roles: { [key: string]: R } = {};
	if (channel.channel_type !== "Group") {
		const server = useServer(channel.server);
		const a = server?.roles ?? {};
		for (let b of Object.keys(a)) {
			roles[b] = {
				name: a[b].name,
				permissions: a[b].permissions[1],
			};
		}
	}

	const keys = ["default", ...Object.keys(roles)];

	const defaultRole = {
		name: "Default",
		permissions:
			(channel.channel_type === "Group"
				? channel.permissions
				: channel.default_permissions) ?? DEFAULT_PERMISSION_DM,
	};
	const selectedRole = selected === "default" ? defaultRole : roles[selected];

	if (!selectedRole) {
		useEffect(() => setSelected("default"), []);
		return null;
	}

	const [p, setPerm] = useState(selectedRole.permissions >>> 0);

	useEffect(() => {
		setPerm(selectedRole.permissions >>> 0);
	}, [selected, selectedRole.permissions]);

	return (
		<div>
			<Tip warning>This section is under construction.</Tip>
			<h2>select role</h2>
			{selected}
			{keys.map((id) => {
				let role: R = id === "default" ? defaultRole : roles[id];

				return (
					<Checkbox
						checked={selected === id}
						onChange={(selected) => selected && setSelected(id)}>
						{role.name}
					</Checkbox>
				);
			})}
			<h2>channel per??issions</h2>
			{Object.keys(ChannelPermission).map((perm) => {
				let value =
					ChannelPermission[perm as keyof typeof ChannelPermission];
				if (value & DEFAULT_PERMISSION_DM) {
					return (
						<Checkbox
							checked={(p & value) > 0}
							onChange={(c) =>
								setPerm(c ? p | value : p ^ value)
							}>
							{perm}
						</Checkbox>
					);
				}
			})}
			<Button
				contrast
				onClick={() => {
					client.channels.setPermissions(channel._id, selected, p);
				}}>
				click here to save permissions for role
			</Button>
		</div>
	);
}
