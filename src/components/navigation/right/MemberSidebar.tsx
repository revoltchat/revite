/* eslint-disable react-hooks/rules-of-hooks */
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Role } from "revolt-api/types/Servers";
import { Presence } from "revolt-api/types/Users";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Server } from "revolt.js/dist/maps/Servers";
import { User } from "revolt.js/dist/maps/Users";
import styled, { css } from "styled-components";

import { useContext, useEffect, useMemo } from "preact/hooks";

import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

import { GenericSidebarBase } from "../SidebarBase";
import MemberList, { MemberListGroup } from "./MemberList";

export const Container = styled.div`
    padding-top: 48px;

    ${isTouchscreenDevice &&
    css`
        padding-top: 0;
    `}
`;

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

function useEntries(channel: Channel, keys: string[], isServer?: boolean) {
    const client = channel.client;
    return useMemo(() => {
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
                            Role,
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

            if (!u.online || u.status?.presence === Presence.Invisible) {
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

        if (categories.offline.length > 0) {
            entries.push({
                type: "offline",
                users: categories.offline.map((x) => x[0]),
            });
        }

        return entries;
        // eslint-disable-next-line
    }, [keys]);
}

export const GroupMemberSidebar = observer(
    ({ channel }: { channel: Channel }) => {
        const keys = [...channel.recipient_ids!];
        const entries = useEntries(channel, keys);

        return (
            <GenericSidebarBase>
                <Container>
                    {/*{isTouchscreenDevice && <div>Group settings go here</div>}*/}
                </Container>

                <MemberList entries={entries} context={channel} />
            </GenericSidebarBase>
        );
    },
);

export const ServerMemberSidebar = observer(
    ({ channel }: { channel: Channel }) => {
        const client = useClient();
        const status = useContext(StatusContext);

        useEffect(() => {
            if (status === ClientStatus.ONLINE) {
                channel.server!.fetchMembers();
            }
            // eslint-disable-next-line
        }, [status, channel.server_id]);

        const keys = [...client.members.keys()];
        const entries = useEntries(channel, keys, true);

        return (
            <GenericSidebarBase>
                <Container>
                    {/*{isTouchscreenDevice && <div>Server settings go here</div>}*/}
                </Container>
                <MemberList entries={entries} context={channel} />
            </GenericSidebarBase>
        );
    },
);
