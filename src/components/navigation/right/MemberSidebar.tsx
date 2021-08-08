/* eslint-disable react-hooks/rules-of-hooks */
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Presence } from "revolt-api/types/Users";
import { Channel } from "revolt.js/dist/maps/Channels";
import { User } from "revolt.js/dist/maps/Users";

import { useContext, useEffect, useMemo } from "preact/hooks";

import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

import { GenericSidebarBase } from "../SidebarBase";
import MemberList from "./MemberList";

export default function MemberSidebar({ channel: obj }: { channel?: Channel }) {
    const { channel: channel_id } = useParams<{ channel: string }>();
    const client = useClient();
    const channel = obj ?? client.channels.get(channel_id);

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

            if (isServer) {
                // Sort users into hoisted roles here.
            } else {
                // Sort users into "participants" list here.
                // For voice calls.
            }

            if (!u.online || u.status?.presence === Presence.Invisible) {
                categories.offline.push(entry);
            } else {
                categories.online.push(entry);
            }
        });

        Object.keys(categories).forEach((key) =>
            categories[key].sort((a, b) => a[1].localeCompare(b[1])),
        );

        const entries = [];

        if (categories.online.length > 0) {
            entries.push(
                `online:${categories.online.length}`,
                ...categories.online.map((x) => x[0]),
            );
        }

        if (categories.offline.length > 0) {
            entries.push(
                `offline:${categories.offline.length}`,
                ...categories.offline.map((x) => x[0]),
            );
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
        }, [status, channel.server]);

        const keys = [...client.members.keys()];
        const entries = useEntries(channel, keys, true);

        return (
            <GenericSidebarBase>
                <MemberList entries={entries} context={channel} />
            </GenericSidebarBase>
        );
    },
);
