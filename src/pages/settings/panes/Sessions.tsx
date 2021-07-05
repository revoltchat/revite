import { HelpCircle } from "@styled-icons/boxicons-regular";
import {
	Android,
	Firefoxbrowser,
	Googlechrome,
	Ios,
	Linux,
	Macos,
	Microsoftedge,
	Safari,
	Windows,
} from "@styled-icons/simple-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useHistory } from "react-router-dom";
import { decodeTime } from "ulid";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Button from "../../../components/ui/Button";
import Preloader from "../../../components/ui/Preloader";
import Tip from "../../../components/ui/Tip";

dayjs.extend(relativeTime);

interface Session {
	id: string;
	friendly_name: string;
}

export function Sessions() {
	const client = useContext(AppContext);
	const deviceId = client.session?.id;

	const [sessions, setSessions] = useState<Session[] | undefined>(undefined);
	const [attemptingDelete, setDelete] = useState<string[]>([]);
	const history = useHistory();

	function switchPage(to: string) {
		history.replace(`/settings/${to}`);
	}

	useEffect(() => {
		client.req("GET", "/auth/sessions").then((data) => {
			data.sort(
				(a, b) =>
					(b.id === deviceId ? 1 : 0) - (a.id === deviceId ? 1 : 0),
			);
			setSessions(data);
		});
	}, []);

	if (typeof sessions === "undefined") {
		return (
			<div className={styles.loader}>
				<Preloader type="ring" />
			</div>
		);
	}

	function getIcon(session: Session) {
		const name = session.friendly_name;
		switch (true) {
			case /firefox/i.test(name):
				return <Firefoxbrowser />;
			case /chrome/i.test(name):
				return <Googlechrome />;
			case /safari/i.test(name):
				return <Safari />;
			case /edge/i.test(name):
				return <Microsoftedge />;
			default:
				return <HelpCircle />;
		}
	}

	function getSystemIcon(session: Session) {
		const name = session.friendly_name;
		switch (true) {
			case /linux/i.test(name):
				return <Linux />;
			case /android/i.test(name):
				return <Android />;
			case /mac.*os/i.test(name):
				return <Macos />;
			case /ios/i.test(name):
				return <Ios />;
			case /windows/i.test(name):
				return <Windows />;
			default:
				return null;
		}
	}

	const mapped = sessions.map((session) => {
		return {
			...session,
			timestamp: decodeTime(session.id),
		};
	});

	mapped.sort((a, b) => b.timestamp - a.timestamp);
	let id = mapped.findIndex((x) => x.id === deviceId);

	const render = [
		mapped[id],
		...mapped.slice(0, id),
		...mapped.slice(id + 1, mapped.length),
	];

	return (
		<div className={styles.sessions}>
			<h3>
				<Text id="app.settings.pages.sessions.active_sessions" />
			</h3>
			{render.map((session) => (
				<div
					className={styles.entry}
					data-active={session.id === deviceId}
					data-deleting={attemptingDelete.indexOf(session.id) > -1}>
					{deviceId === session.id && (
						<span className={styles.label}>
							<Text id="app.settings.pages.sessions.this_device" />{" "}
						</span>
					)}
					<div className={styles.session}>
						<div className={styles.icon}>
							{getIcon(session)}
							<div>{getSystemIcon(session)}</div>
						</div>
						<div className={styles.info}>
							<span className={styles.name}>
								{session.friendly_name}
							</span>
							<span className={styles.time}>
								<Text
									id="app.settings.pages.sessions.created"
									fields={{
										time_ago: dayjs(
											session.timestamp,
										).fromNow(),
									}}
								/>
							</span>
						</div>
						{deviceId !== session.id && (
							<Button
								onClick={async () => {
									setDelete([
										...attemptingDelete,
										session.id,
									]);
									await client.req(
										"DELETE",
										`/auth/sessions/${session.id}` as "/auth/sessions",
									);
									setSessions(
										sessions?.filter(
											(x) => x.id !== session.id,
										),
									);
								}}
								disabled={
									attemptingDelete.indexOf(session.id) > -1
								}>
								<Text id="app.settings.pages.logOut" />
							</Button>
						)}
					</div>
				</div>
			))}
			<Tip>
				<span>
					<Text id="app.settings.tips.sessions.a" />
				</span>{" "}
				<a onClick={() => switchPage("account")}>
					<Text id="app.settings.tips.sessions.b" />
				</a>
			</Tip>
		</div>
	);
}
