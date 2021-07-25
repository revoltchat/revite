import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { User } from "revolt.js";
import { Channels, Message, Servers, Users } from "revolt.js/dist/api/objects";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { getState } from "../../../redux";

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
import Button from "../../ui/Button";
import Category from "../../ui/Category";
import InputBox from "../../ui/InputBox";
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
    const members = channel.recipients
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
        const l =
            +(
                (a.online && a.status?.presence !== Users.Presence.Invisible) ??
                false
            ) | 0;
        const r =
            +(
                (b.online && b.status?.presence !== Users.Presence.Invisible) ??
                false
            ) | 0;

        const n = r - l;
        if (n !== 0) {
            return n;
        }

        return a.username.localeCompare(b.username);
    });

    return (
        <GenericSidebarBase>
            <GenericSidebarList>
                <ChannelDebugInfo id={channel._id} />
                <Search channel={channel._id} />

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
                    {members.length === 0 && (
                        <img src={placeholderSVG} loading="eager" />
                    )}
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
            client.members
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
        const l =
            +(
                (a.online && a.status?.presence !== Users.Presence.Invisible) ??
                false
            ) | 0;
        const r =
            +(
                (b.online && b.status?.presence !== Users.Presence.Invisible) ??
                false
            ) | 0;

        const n = r - l;
        if (n !== 0) {
            return n;
        }

        return a.username.localeCompare(b.username);
    });

    return (
        <GenericSidebarBase>
            <GenericSidebarList>
                <ChannelDebugInfo id={channel._id} />
                <Search channel={channel._id} />
                <div>{!members && <Preloader type="ring" />}</div>
                {members && (
                    <CollapsibleSection
                        //sticky //will re-add later, need to fix css
                        id="members"
                        defaultValue
                        summary={
                            <span>
                                <Text id="app.main.categories.members" /> —{" "}
                                {users.length}
                            </span>
                        }>
                        {users.length === 0 && (
                            <img src={placeholderSVG} loading="eager" />
                        )}
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

function Search({ channel }: { channel: string }) {
    if (!getState().experiments.enabled?.includes("search")) return null;

    const client = useContext(AppContext);
    type Sort = "Relevance" | "Latest" | "Oldest";
    const [sort, setSort] = useState<Sort>("Relevance");

    const [query, setV] = useState("");
    const [results, setResults] = useState<Message[]>([]);

    async function search() {
        const data = await client.channels.searchWithUsers(
            channel,
            { query, sort },
            true,
        );
        setResults(data.messages);
    }

    return (
        <CollapsibleSection
            sticky
            id="search"
            defaultValue={false}
            summary={
                <>
                    <Text id="app.main.channel.search.title" /> (BETA)
                </>
            }>
            <div style={{ display: "flex" }}>
                {["Relevance", "Latest", "Oldest"].map((key) => (
                    <Button
                        style={{ flex: 1, minWidth: 0 }}
                        compact
                        error={sort === key}
                        onClick={() => setSort(key as Sort)}>
                        <Text
                            id={`app.main.channel.search.sort.${key.toLowerCase()}`}
                        />
                    </Button>
                ))}
            </div>
            <InputBox
                style={{ width: "100%" }}
                onKeyDown={(e) => e.key === "Enter" && search()}
                value={query}
                onChange={(e) => setV(e.currentTarget.value)}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginTop: "8px",
                }}>
                {results.map((message) => {
                    let href = "";
                    const channel = client.channels.get(message.channel);
                    if (channel?.channel_type === "TextChannel") {
                        href += `/server/${channel.server}`;
                    }

                    href += `/channel/${message.channel}/${message._id}`;

                    return (
                        <Link to={href}>
                            <div
                                style={{
                                    margin: "2px",
                                    padding: "6px",
                                    background: "var(--primary-background)",
                                }}>
                                <b>
                                    @
                                    {client.users.get(message.author)?.username}
                                </b>
                                <br />
                                {message.content}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </CollapsibleSection>
    );
}
