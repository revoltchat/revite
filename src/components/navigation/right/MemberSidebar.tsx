/* eslint-disable react-hooks/rules-of-hooks */
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Channel, Server, User, API } from "revolt.js";

import { useEffect, useLayoutEffect, useState } from "preact/hooks";

import {
    useSession,
    useClient,
} from "../../../controllers/client/ClientController";
import { GenericSidebarBase } from "../SidebarBase";
import MemberList, { MemberListGroup } from "./MemberList";

export default function MemberSidebar() {
    const channel = useClient().channels.get(
        useParams<{ channel: string }>().channel,
    );

    switch (channel?.channel_type) {
        case "Group":
            return <GroupMemberSidebar channel={channel} />;
        case "TextChannel":
            return <ServerMemberSidebar channel={channel} />;
        default:
            return null;
    }
}

function useEntries(
    channel: Channel,
    generateKeys: () => string[],
    isServer?: boolean,
) {
    const client = channel.client;
    const [entries, setEntries] = useState<MemberListGroup[]>([]);

    function sort(keys: string[]) {
        const categories: { [key: string]: [User, string][] } = {
            online: [],
            offline: [],
        };

        const categoryInfo: { [key: string]: string } = {};

        let roles: Server["roles"] | undefined;
        let roleList: string[];
        if (
            channel.channel_type === "TextChannel" ||
            channel.channel_type === "VoiceChannel"
        ) {
            roles = channel.server?.roles;
            if (roles) {
                const list = Object.keys(roles)
                    .map((id) => {
                        return [id, roles![id], roles![id].rank ?? 0] as [
                            string,
                            API.Role,
                            number,
                        ];
                    })
                    .filter(([, role]) => role.hoist);

                list.sort((b, a) => b[2] - a[2]);

                list.forEach(([id, role]) => {
                    if (categories[id]) return;
                    categories[id] = [];
                    categoryInfo[id] = role.name;
                });

                roleList = list.map((x) => x[0]);
            }
        }

        keys.forEach((key) => {
            let u;
            if (isServer) {
                const { server, user } = JSON.parse(key);
                if (server !== channel.server_id) return;
                u = client.users.get(user);
            } else {
                u = client.users.get(key);
            }

            if (!u) return;

            const member = client.members.get(key);
            const sort = member?.nickname ?? u.username;
            const entry = [u, sort] as [User, string];

            if (!u.online || u.status?.presence === "Invisible") {
                categories.offline.push(entry);
            } else {
                if (isServer) {
                    // Sort users into hoisted roles here.
                    if (member?.roles && roles) {
                        let success = false;
                        for (const role of roleList) {
                            if (member.roles.includes(role)) {
                                categories[role].push(entry);
                                success = true;
                                break;
                            }
                        }

                        if (success) return;
                    }
                } else {
                    // Sort users into "participants" list here.
                    // For voice calls.
                }

                categories.online.push(entry);
            }
        });

        Object.keys(categories).forEach((key) =>
            categories[key].sort((a, b) => a[1].localeCompare(b[1])),
        );

        const entries: MemberListGroup[] = [];

        Object.keys(categoryInfo).forEach((key) => {
            if (categories[key].length > 0) {
                entries.push({
                    type: "role",
                    name: categoryInfo[key],
                    users: categories[key].map((x) => x[0]),
                });
            }
        });

        if (categories.online.length > 0) {
            entries.push({
                type: "online",
                users: categories.online.map((x) => x[0]),
            });
        }

        // ! FIXME: Temporary performance fix
        if (shouldSkipOffline(channel.server_id!)) {
            entries.push({
                type: "no_offline",
                users: [null!],
            });
        } else if (categories.offline.length > 0) {
            entries.push({
                type: "offline",
                users: categories.offline.map((x) => x[0]),
            });
        }

        setEntries(entries);
    }

    useEffect(() => {
        return autorun(() => sort(generateKeys()));
        // eslint-disable-next-line
    }, [channel]);

    return entries;
}

export const GroupMemberSidebar = observer(
    ({ channel }: { channel: Channel }) => {
        const entries = useEntries(channel, () => channel.recipient_ids!);

        return (
            <GenericSidebarBase data-scroll-offset="with-padding">
                {/*<Container>
                    {isTouchscreenDevice && <div>Group settings go here</div>}
                </Container>*/}

                <MemberList entries={entries} context={channel} />
            </GenericSidebarBase>
        );
    },
);

// ! FIXME: this is temporary code until we get lazy guilds like subscriptions
const FETCHED: Set<string> = new Set();

export function resetMemberSidebarFetched() {
    FETCHED.clear();
}

const SKIP_OFFLINE = new Set(["01F7ZSBSFHQ8TA81725KQCSDDP"]);

let SKIP_ENABLED = true;
export function setOfflineSkipEnabled(value: boolean) {
    SKIP_ENABLED = value;
}

function shouldSkipOffline(id: string) {
    if (SKIP_ENABLED) {
        return SKIP_OFFLINE.has(id);
    }

    return false;
}

export const ServerMemberSidebar = observer(
    ({ channel }: { channel: Channel }) => {
        const session = useSession()!;
        const client = session.client!;

        useEffect(() => {
            const server_id = channel.server_id!;
            if (session.state === "Online" && !FETCHED.has(server_id)) {
                FETCHED.add(server_id);
                channel
                    .server!.syncMembers(shouldSkipOffline(server_id))
                    .catch(() => FETCHED.delete(server_id));
            }
        }, [session.state, channel]);

        const entries = useEntries(
            channel,
            () => [...client.members.keys()],
            true,
        );

        return (
            <GenericSidebarBase data-scroll-offset="with-padding">
                {/*<Container>
                    {isTouchscreenDevice && <div>Server settings go here</div>}
                </Container>*/}
                <MemberList entries={entries} context={channel} />
            </GenericSidebarBase>
        );
    },
);
