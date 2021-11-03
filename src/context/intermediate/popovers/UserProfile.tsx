import { Envelope, Edit, UserPlus } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link, useHistory } from "react-router-dom";
import { Profile, RelationshipStatus } from "revolt-api/types/Users";
import { UserPermission } from "revolt.js/dist/api/permissions";
import { Route } from "revolt.js/dist/api/routes";

import styles from "./UserProfile.module.scss";
import { Localizer, Text } from "preact-i18n";
import { useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";

import ChannelIcon from "../../../components/common/ChannelIcon";
import ServerIcon from "../../../components/common/ServerIcon";
import Tooltip from "../../../components/common/Tooltip";
import UserBadges from "../../../components/common/user/UserBadges";
import UserIcon from "../../../components/common/user/UserIcon";
import { Username } from "../../../components/common/user/UserShort";
import UserStatus from "../../../components/common/user/UserStatus";
import IconButton from "../../../components/ui/IconButton";
import Modal from "../../../components/ui/Modal";
import Overline from "../../../components/ui/Overline";
import Preloader from "../../../components/ui/Preloader";

import Markdown from "../../../components/markdown/Markdown";
import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../revoltjs/RevoltClient";
import { useIntermediate } from "../Intermediate";

interface Props {
    user_id: string;
    dummy?: boolean;
    onClose?: () => void;
    dummyProfile?: Profile;
}

enum Badges {
    Developer = 1,
    Translator = 2,
    Supporter = 4,
    ResponsibleDisclosure = 8,
    EarlyAdopter = 256,
}

export const UserProfile = observer(
    ({ user_id, onClose, dummy, dummyProfile }: Props) => {
        const { openScreen, writeClipboard } = useIntermediate();

        const [profile, setProfile] = useState<undefined | null | Profile>(
            undefined,
        );
        const [mutual, setMutual] = useState<
            undefined | null | Route<"GET", "/users/id/mutual">["response"]
        >(undefined);

        const history = useHistory();
        const client = useClient();
        const status = useContext(StatusContext);
        const [tab, setTab] = useState("profile");

        const user = client.users.get(user_id);
        if (!user) {
            if (onClose) useEffect(onClose, []);
            return null;
        }

        const users = mutual?.users.map((id) => client.users.get(id));

        const mutualGroups = [...client.channels.values()].filter(
            (channel) =>
                channel?.channel_type === "Group" &&
                channel.recipient_ids!.includes(user_id),
        );

        const mutualServers = mutual?.servers.map((id) =>
            client.servers.get(id),
        );

        useLayoutEffect(() => {
            if (!user_id) return;
            if (typeof profile !== "undefined") setProfile(undefined);
            if (typeof mutual !== "undefined") setMutual(undefined);
            // eslint-disable-next-line
        }, [user_id]);

        useEffect(() => {
            if (dummy) {
                setProfile(dummyProfile);
            }
        }, [dummy, dummyProfile]);

        useEffect(() => {
            if (dummy) return;
            if (
                status === ClientStatus.ONLINE &&
                typeof mutual === "undefined"
            ) {
                setMutual(null);
                user.fetchMutual().then(setMutual);
            }
        }, [mutual, status, dummy, user]);

        useEffect(() => {
            if (dummy) return;
            if (
                status === ClientStatus.ONLINE &&
                typeof profile === "undefined"
            ) {
                setProfile(null);

                if (user.permission & UserPermission.ViewProfile) {
                    user.fetchProfile().then(setProfile);
                }
            }
        }, [profile, status, dummy, user]);

        const backgroundURL =
            profile &&
            client.generateFileURL(profile.background, { width: 1000 }, true);

        const badges = user.badges ?? 0;
        const flags = user.flags ?? 0;

        return (
            <Modal
                visible
                border={dummy}
                padding={false}
                onClose={onClose}
                dontModal={dummy}>
                <div
                    className={styles.header}
                    data-force={profile?.background ? "light" : undefined}
                    style={{
                        backgroundImage:
                            backgroundURL &&
                            `linear-gradient( rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7) ), url('${backgroundURL}')`,
                    }}>
                    <div className={styles.profile}>
                        <UserIcon
                            size={80}
                            target={user}
                            status
                            animate
                            hover={typeof user.avatar !== "undefined"}
                            onClick={() =>
                                user.avatar &&
                                openScreen({
                                    id: "image_viewer",
                                    attachment: user.avatar,
                                })
                            }
                        />
                        <div className={styles.details}>
                            <Localizer>
                                <span
                                    className={styles.username}
                                    onClick={() =>
                                        writeClipboard(user.username)
                                    }>
                                    @{user.username}
                                </span>
                            </Localizer>
                            {user.status?.text && (
                                <span className={styles.status}>
                                    <UserStatus user={user} tooltip />
                                </span>
                            )}
                        </div>
                        {user.relationship === RelationshipStatus.Friend && (
                            <Localizer>
                                <Tooltip
                                    content={
                                        <Text id="app.context_menu.message_user" />
                                    }>
                                    <IconButton
                                        onClick={() => {
                                            onClose?.();
                                            history.push(`/open/${user_id}`);
                                        }}>
                                        <Envelope size={30} />
                                    </IconButton>
                                </Tooltip>
                            </Localizer>
                        )}
                        {user.relationship === RelationshipStatus.User &&
                            !dummy && (
                                <Localizer>
                                    <Tooltip
                                        content={
                                            <Text id="app.settings.pages.profile.edit_profile" />
                                        }>
                                        <IconButton
                                            onClick={() => {
                                                onClose?.();
                                                history.push(
                                                    `/settings/profile`,
                                                );
                                            }}>
                                            <Edit size={30} />
                                        </IconButton>
                                    </Tooltip>
                                </Localizer>
                            )}
                        {!user.bot &&
                            flags != 2 &&
                            flags != 4 &&
                            (user.relationship ===
                                RelationshipStatus.Incoming ||
                                user.relationship ===
                                    RelationshipStatus.None) && (
                                <Localizer>
                                    <Tooltip
                                        content={
                                            <Text id="app.context_menu.add_friend" />
                                        }>
                                        <IconButton
                                            onClick={() => user.addFriend()}>
                                            <UserPlus size={30} />
                                        </IconButton>
                                    </Tooltip>
                                </Localizer>
                            )}
                    </div>
                    <div className={styles.tabs}>
                        <div
                            data-active={tab === "profile"}
                            onClick={() => setTab("profile")}>
                            <Text id="app.special.popovers.user_profile.profile" />
                        </div>
                        {user.relationship !== RelationshipStatus.User && (
                            <>
                                <div
                                    data-active={tab === "friends"}
                                    onClick={() => setTab("friends")}>
                                    <Text id="app.special.popovers.user_profile.mutual_friends" />
                                </div>
                                <div
                                    data-active={tab === "groups"}
                                    onClick={() => setTab("groups")}>
                                    <Text id="app.special.popovers.user_profile.mutual_groups" />
                                </div>
                                <div
                                    data-active={tab === "servers"}
                                    onClick={() => setTab("servers")}>
                                    <Text id="app.special.popovers.user_profile.mutual_servers" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.content}>
                    {tab === "profile" && (
                        <div>
                            {!(
                                profile?.content ||
                                badges > 0 ||
                                flags > 0 ||
                                user.bot
                            ) && (
                                <div className={styles.empty}>
                                    <Text id="app.special.popovers.user_profile.empty" />
                                </div>
                            )}
                            {flags & 1 ? (
                                /** ! FIXME: i18n this area */
                                <Overline type="error" block>
                                    User is suspended
                                </Overline>
                            ) : undefined}
                            {flags & 2 ? (
                                <Overline type="error" block>
                                    User deleted their account
                                </Overline>
                            ) : undefined}
                            {flags & 4 ? (
                                <Overline type="error" block>
                                    User is banned
                                </Overline>
                            ) : undefined}
                            {user.bot ? (
                                <>
                                    <div className={styles.category}>
                                        bot owner
                                    </div>
                                    <div
                                        onClick={() =>
                                            user.bot &&
                                            openScreen({
                                                id: "profile",
                                                user_id: user.bot.owner,
                                            })
                                        }
                                        className={styles.entry}
                                        key={user.bot.owner}>
                                        <UserIcon
                                            size={32}
                                            target={client.users.get(
                                                user.bot.owner,
                                            )}
                                        />
                                        <span>
                                            <Username
                                                user={client.users.get(
                                                    user.bot.owner,
                                                )}
                                            />
                                        </span>
                                    </div>
                                </>
                            ) : undefined}
                            {badges > 0 && (
                                <div className={styles.category}>
                                    <Text id="app.special.popovers.user_profile.sub.badges" />
                                </div>
                            )}
                            {badges > 0 && (
                                <UserBadges badges={badges} uid={user._id} />
                            )}
                            {profile?.content && (
                                <div className={styles.category}>
                                    <Text id="app.special.popovers.user_profile.sub.information" />
                                </div>
                            )}
                            <Markdown content={profile?.content} />
                            {/*<div className={styles.category}><Text id="app.special.popovers.user_profile.sub.connections" /></div>*/}
                        </div>
                    )}
                    {tab === "friends" &&
                        (users ? (
                            <div className={styles.entries}>
                                {users.length === 0 ? (
                                    <div className={styles.empty}>
                                        <Text id="app.special.popovers.user_profile.no_users" />
                                    </div>
                                ) : (
                                    users.map(
                                        (x) =>
                                            x && (
                                                <div
                                                    onClick={() =>
                                                        openScreen({
                                                            id: "profile",
                                                            user_id: x._id,
                                                        })
                                                    }
                                                    className={styles.entry}
                                                    key={x._id}>
                                                    <UserIcon
                                                        size={32}
                                                        target={x}
                                                    />
                                                    <span>{x.username}</span>
                                                </div>
                                            ),
                                    )
                                )}
                            </div>
                        ) : (
                            <Preloader type="ring" />
                        ))}
                    {tab === "groups" && (
                        <div className={styles.entries}>
                            {mutualGroups.length === 0 ? (
                                <div className={styles.empty}>
                                    <Text id="app.special.popovers.user_profile.no_groups" />
                                </div>
                            ) : (
                                mutualGroups.map(
                                    (x) =>
                                        x?.channel_type === "Group" && (
                                            <Link to={`/channel/${x._id}`}>
                                                <div
                                                    className={styles.entry}
                                                    key={x._id}>
                                                    <ChannelIcon
                                                        target={x}
                                                        size={32}
                                                    />
                                                    <span>{x.name}</span>
                                                </div>
                                            </Link>
                                        ),
                                )
                            )}
                        </div>
                    )}
                    {tab === "servers" && (
                        <div className={styles.entries}>
                            {!mutualServers || mutualServers.length === 0 ? (
                                <div className={styles.empty}>
                                    <Text id="app.special.popovers.user_profile.no_servers" />
                                </div>
                            ) : (
                                mutualServers.map(
                                    (x) =>
                                        x && (
                                            <Link to={`/server/${x._id}`}>
                                                <div
                                                    className={styles.entry}
                                                    key={x._id}>
                                                    <ServerIcon
                                                        target={x}
                                                        size={32}
                                                    />
                                                    <span>{x.name}</span>
                                                </div>
                                            </Link>
                                        ),
                                )
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        );
    },
);
