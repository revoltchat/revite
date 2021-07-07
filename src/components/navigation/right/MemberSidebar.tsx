import { useParams } from "react-router";
import { User } from "revolt.js";
import { Channels, Servers, Users } from "revolt.js/dist/api/objects";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import {
    AppContext,
    ClientStatus,
    StatusContext,
} from "../../../context/revoltjs/RevoltClient";
import {
    HookContext,
    useChannel,
    useForceUpdate,
    useUsers,
} from "../../../context/revoltjs/hooks";

import CollapsibleSection from "../../common/CollapsibleSection";
import Category from "../../ui/Category";
import Preloader from "../../ui/Preloader";
import placeholderSVG from "../items/placeholder.svg";

import { GenericSidebarBase, GenericSidebarList } from "../SidebarBase";
import { UserButton } from "../items/ButtonItem";
import { ChannelDebugInfo } from "./ChannelDebugInfo";

interface Props {
    ctx: HookContext;
}

export default function MemberSidebar(props: { channel?: Channels.Channel }) {
    const ctx = useForceUpdate();
    const { channel: cid } = useParams<{ channel: string }>();
    const channel = props.channel ?? useChannel(cid, ctx);

    switch (channel?.channel_type) {
        case "Group":
            return <GroupMemberSidebar channel={channel} ctx={ctx} />;
        case "TextChannel":
            return <ServerMemberSidebar channel={channel} ctx={ctx} />;
        default:
            return null;
    }
}

export function GroupMemberSidebar({
    channel,
    ctx,
}: Props & { channel: Channels.GroupChannel }) {
    const { openScreen } = useIntermediate();
    const users = useUsers(undefined, ctx);
    let members = channel.recipients
        .map((x) => users.find((y) => y?._id === x))
        .filter((x) => typeof x !== "undefined") as User[];

    /*const voice = useContext(VoiceContext);
    const voiceActive = voice.roomId === channel._id;

    let voiceParticipants: User[] = [];
    if (voiceActive) {
        const idArray = Array.from(voice.participants.keys());
        voiceParticipants = idArray
            .map(x => users.find(y => y?._id === x))
            .filter(x => typeof x !== "undefined") as User[];

        members = members.filter(member => idArray.indexOf(member._id) === -1);

        voiceParticipants.sort((a, b) => a.username.localeCompare(b.username));
    }*/

    members.sort((a, b) => {
        // ! FIXME: should probably rewrite all this code
        let l =
            +(
                (a.online && a.status?.presence !== Users.Presence.Invisible) ??
                false
            ) | 0;
        let r =
            +(
                (b.online && b.status?.presence !== Users.Presence.Invisible) ??
                false
            ) | 0;

        let n = r - l;
        if (n !== 0) {
            return n;
        }

        return a.username.localeCompare(b.username);
    });

    return (
        <GenericSidebarBase>
            <GenericSidebarList>
                <ChannelDebugInfo id={channel._id} />
                {/*voiceActive && voiceParticipants.length !== 0 && (
                    <Fragment>
                        <Category
                            type="members"
                            text={
                                <span>
                                    <Text id="app.main.categories.participants" />{" "}
                                    — {voiceParticipants.length}
                                </span>
                            }
                        />
                        {voiceParticipants.map(
                            user =>
                                user && (
                                    <LinkProfile user_id={user._id}>
                                        <UserButton
                                            key={user._id}
                                            user={user}
                                            context={channel}
                                        />
                                    </LinkProfile>
                                )
                        )}
                    </Fragment>
                )*/}
                <CollapsibleSection
                    sticky
                    id="members"
                    defaultValue
                    summary={
                        <Category
                            variant="uniform"
                            text={
                                <span>
                                    <Text id="app.main.categories.members" /> —{" "}
                                    {channel.recipients.length}
                                </span>
                            }
                        />
                    }>
                    {members.length === 0 && <img src={placeholderSVG} />}
                    {members.map(
                        (user) =>
                            user && (
                                <UserButton
                                    key={user._id}
                                    user={user}
                                    context={channel}
                                    onClick={() =>
                                        openScreen({
                                            id: "profile",
                                            user_id: user._id,
                                        })
                                    }
                                />
                            ),
                    )}
                </CollapsibleSection>
            </GenericSidebarList>
        </GenericSidebarBase>
    );
}

export function ServerMemberSidebar({
    channel,
    ctx,
}: Props & { channel: Channels.TextChannel }) {
    const [members, setMembers] = useState<Servers.Member[] | undefined>(
        undefined,
    );
    const users = useUsers(members?.map((x) => x._id.user) ?? []).filter(
        (x) => typeof x !== "undefined",
        ctx,
    ) as Users.User[];
    const { openScreen } = useIntermediate();
    const status = useContext(StatusContext);
    const client = useContext(AppContext);

    useEffect(() => {
        if (status === ClientStatus.ONLINE && typeof members === "undefined") {
            client.servers.members
                .fetchMembers(channel.server)
                .then((members) => setMembers(members));
        }
    }, [status]);

    // ! FIXME: temporary code
    useEffect(() => {
        function onPacket(packet: ClientboundNotification) {
            if (!members) return;
            if (packet.type === "ServerMemberJoin") {
                if (packet.id !== channel.server) return;
                setMembers([
                    ...members,
                    { _id: { server: packet.id, user: packet.user } },
                ]);
            } else if (packet.type === "ServerMemberLeave") {
                if (packet.id !== channel.server) return;
                setMembers(
                    members.filter(
                        (x) =>
                            !(
                                x._id.user === packet.user &&
                                x._id.server === packet.id
                            ),
                    ),
                );
            }
        }

        client.addListener("packet", onPacket);
        return () => client.removeListener("packet", onPacket);
    }, [members]);

    // copy paste from above
    users.sort((a, b) => {
        // ! FIXME: should probably rewrite all this code
        let l =
            +(
                (a.online && a.status?.presence !== Users.Presence.Invisible) ??
                false
            ) | 0;
        let r =
            +(
                (b.online && b.status?.presence !== Users.Presence.Invisible) ??
                false
            ) | 0;

        let n = r - l;
        if (n !== 0) {
            return n;
        }

        return a.username.localeCompare(b.username);
    });

    return (
        <GenericSidebarBase>
            <GenericSidebarList>
                <ChannelDebugInfo id={channel._id} />
                <div>{!members && <Preloader type="ring" />}</div>
                {members && (
                    <CollapsibleSection
                        //sticky //will re-add later, need to fix css 
                        id="members"
                        defaultValue
                        summary={<span>
                                        <Text id="app.main.categories.members" />{" "}
                                        — {users.length}
                                    </span>
                                }

                        >
                        {users.length === 0 && <img src={placeholderSVG} />}
                        {users.map(
                            (user) =>
                                user && (
                                    <UserButton
                                        key={user._id}
                                        user={user}
                                        context={channel}
                                        onClick={() =>
                                            openScreen({
                                                id: "profile",
                                                user_id: user._id,
                                            })
                                        }
                                    />
                                ),
                        )}
                    </CollapsibleSection>
                )}
            </GenericSidebarList>
        </GenericSidebarBase>
    );
}
