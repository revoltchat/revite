import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { Presence } from "revolt-api/types/Users";
import { Channel } from "revolt.js/dist/maps/Channels";
import Members, { Member } from "revolt.js/dist/maps/Members";
import { Message } from "revolt.js/dist/maps/Messages";
import { User } from "revolt.js/dist/maps/Users";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { getState } from "../../../redux";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import {
    AppContext,
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

import CollapsibleSection from "../../common/CollapsibleSection";
import Button from "../../ui/Button";
import Category from "../../ui/Category";
import InputBox from "../../ui/InputBox";
import Preloader from "../../ui/Preloader";
import placeholderSVG from "../items/placeholder.svg";

import { GenericSidebarBase, GenericSidebarList } from "../SidebarBase";
import { UserButton } from "../items/ButtonItem";
import { ChannelDebugInfo } from "./ChannelDebugInfo";

export default function MemberSidebar({ channel }: { channel?: Channel }) {
    switch (channel?.channel_type) {
        case "Group":
            return <GroupMemberSidebar channel={channel} />;
        case "TextChannel":
            return <ServerMemberSidebar channel={channel} />;
        default:
            return null;
    }
}

export const GroupMemberSidebar = observer(
    ({ channel }: { channel: Channel }) => {
        const { openScreen } = useIntermediate();

        const client = useClient();
        const members = channel.recipients?.filter(
            (x) => typeof x !== "undefined",
        );

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

        members?.sort((a, b) => {
            // ! FIXME: should probably rewrite all this code
            const l =
                +(
                    (a!.online && a!.status?.presence !== Presence.Invisible) ??
                    false
                ) | 0;
            const r =
                +(
                    (b!.online && b!.status?.presence !== Presence.Invisible) ??
                    false
                ) | 0;

            const n = r - l;
            if (n !== 0) {
                return n;
            }

            return a!.username.localeCompare(b!.username);
        });

        return (
            <GenericSidebarBase>
                <GenericSidebarList>
                    <ChannelDebugInfo id={channel._id} />
                    <Search channel={channel} />

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
                                        <Text id="app.main.categories.members" />{" "}
                                        — {channel.recipients?.length ?? 0}
                                    </span>
                                }
                            />
                        }>
                        {members?.length === 0 && (
                            <img src={placeholderSVG} loading="eager" />
                        )}
                        {members?.map(
                            (user) =>
                                user && (
                                    <UserButton
                                        key={user._id}
                                        user={user}
                                        context={channel!}
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
    },
);

export const ServerMemberSidebar = observer(
    ({ channel }: { channel: Channel }) => {
        const client = useClient();
        const { openScreen } = useIntermediate();
        const status = useContext(StatusContext);

        useEffect(() => {
            if (status === ClientStatus.ONLINE) {
                channel.server!.fetchMembers();
            }
        }, [status]);

        let users = [...client.members.keys()]
            .map((x) => JSON.parse(x))
            .filter((x) => x.server === channel.server_id)
            .map((y) => client.users.get(y.user)!)
            .filter((z) => typeof z !== "undefined");

        // copy paste from above
        users.sort((a, b) => {
            // ! FIXME: should probably rewrite all this code
            const l =
                +(
                    (a.online && a.status?.presence !== Presence.Invisible) ??
                    false
                ) | 0;
            const r =
                +(
                    (b.online && b.status?.presence !== Presence.Invisible) ??
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
                    <Search channel={channel} />
                    <div>{users.length === 0 && <Preloader type="ring" />}</div>
                    {users.length > 0 && (
                        <CollapsibleSection
                            //sticky //will re-add later, need to fix css
                            id="members"
                            defaultValue
                            summary={
                                <span>
                                    <Text id="app.main.categories.members" /> —{" "}
                                    {users?.length ?? 0}
                                </span>
                            }>
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
    },
);

function Search({ channel }: { channel: Channel }) {
    if (!getState().experiments.enabled?.includes("search")) return null;

    const client = useContext(AppContext);
    type Sort = "Relevance" | "Latest" | "Oldest";
    const [sort, setSort] = useState<Sort>("Relevance");

    const [query, setV] = useState("");
    const [results, setResults] = useState<Message[]>([]);

    async function search() {
        const data = await channel.searchWithUsers({ query, sort });
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
                                <b>@{message.author?.username}</b>
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
