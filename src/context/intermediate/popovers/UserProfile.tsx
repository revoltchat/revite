import { Money } from "@styled-icons/boxicons-regular";
import { Envelope, Edit, UserPlus, Shield } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link, useHistory } from "react-router-dom";
import { Profile, RelationshipStatus } from "revolt-api/types/Users";
import { UserPermission } from "revolt.js/dist/api/permissions";
import { Route } from "revolt.js/dist/api/routes";

import styles from "./UserProfile.module.scss";
import { Localizer, Text } from "preact-i18n";
import { useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";

import ChannelIcon from "../../../components/common/ChannelIcon";
import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";
import UserStatus from "../../../components/common/user/UserStatus";
import IconButton from "../../../components/ui/IconButton";
import Modal from "../../../components/ui/Modal";
import Preloader from "../../../components/ui/Preloader";

import Markdown from "../../../components/markdown/Markdown";
import {
    AppContext,
    ClientStatus,
    StatusContext,
    useClient,
} from "../../revoltjs/RevoltClient";
import { useIntermediate } from "../Intermediate";

interface Props {
    user_id: string;
    dummy?: boolean;
    onClose: () => void;
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
            useEffect(onClose, []);
            return null;
        }

        const users = mutual?.users.map((id) => client.users.get(id));

        const mutualGroups = [...client.channels.values()].filter(
            (channel) =>
                channel?.channel_type === "Group" &&
                channel.recipient_ids!.includes(user_id),
        );

        useLayoutEffect(() => {
            if (!user_id) return;
            if (typeof profile !== "undefined") setProfile(undefined);
            if (typeof mutual !== "undefined") setMutual(undefined);
        }, [user_id]);

        if (dummy) {
            useLayoutEffect(() => {
                setProfile(dummyProfile);
            }, [dummyProfile]);
        }

        useEffect(() => {
            if (dummy) return;
            if (
                status === ClientStatus.ONLINE &&
                typeof mutual === "undefined"
            ) {
                setMutual(null);
                user.fetchMutual().then(setMutual);
            }
        }, [mutual, status]);

        useEffect(() => {
            if (dummy) return;
            if (
                status === ClientStatus.ONLINE &&
                typeof profile === "undefined"
            ) {
                setProfile(null);

                if (user.permission & UserPermission.ViewProfile) {
                    user.fetchProfile()
                        .then(setProfile)
                        .catch(() => {});
                }
            }
        }, [profile, status]);

        const backgroundURL =
            profile &&
            client.generateFileURL(profile.background, { width: 1000 }, true);
        const badges = user.badges ?? 0;

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
                        <UserIcon size={80} target={user} status animate />
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
                                            onClose();
                                            history.push(`/open/${user_id}`);
                                        }}>
                                        <Envelope size={30} />
                                    </IconButton>
                                </Tooltip>
                            </Localizer>
                        )}
                        {user.relationship === RelationshipStatus.User && (
                            <IconButton
                                onClick={() => {
                                    onClose();
                                    if (dummy) return;
                                    history.push(`/settings/profile`);
                                }}>
                                <Edit size={28} />
                            </IconButton>
                        )}
                        {(user.relationship === RelationshipStatus.Incoming ||
                            user.relationship === RelationshipStatus.None) && (
                            <IconButton onClick={() => user.addFriend()}>
                                <UserPlus size={28} />
                            </IconButton>
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
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.content}>
                    {tab === "profile" && (
                        <div>
                            {!(profile?.content || badges > 0) && (
                                <div className={styles.empty}>
                                    <Text id="app.special.popovers.user_profile.empty" />
                                </div>
                            )}
                            {badges > 0 && (
                                <div className={styles.category}>
                                    <Text id="app.special.popovers.user_profile.sub.badges" />
                                </div>
                            )}
                            {badges > 0 && (
                                <div className={styles.badges}>
                                    <Localizer>
                                        {badges & Badges.Developer ? (
                                            <Tooltip
                                                content={
                                                    <Text id="app.navigation.tabs.dev" />
                                                }>
                                                <img src="/assets/badges/developer.svg" />
                                            </Tooltip>
                                        ) : (
                                            <></>
                                        )}
                                        {badges & Badges.Translator ? (
                                            <Tooltip
                                                content={
                                                    <Text id="app.special.popovers.user_profile.badges.translator" />
                                                }>
                                                <img src="/assets/badges/translator.svg" />
                                            </Tooltip>
                                        ) : (
                                            <></>
                                        )}
                                        {badges & Badges.EarlyAdopter ? (
                                            <Tooltip
                                                content={
                                                    <Text id="app.special.popovers.user_profile.badges.early_adopter" />
                                                }>
                                                <img src="/assets/badges/early_adopter.svg" />
                                            </Tooltip>
                                        ) : (
                                            <></>
                                        )}
                                        {badges & Badges.Supporter ? (
                                            <Tooltip
                                                content={
                                                    <Text id="app.special.popovers.user_profile.badges.supporter" />
                                                }>
                                                <Money
                                                    size={32}
                                                    color="#efab44"
                                                />
                                            </Tooltip>
                                        ) : (
                                            <></>
                                        )}
                                        {badges &
                                        Badges.ResponsibleDisclosure ? (
                                            <Tooltip
                                                content={
                                                    <Text id="app.special.popovers.user_profile.badges.responsible_disclosure" />
                                                }>
                                                <Shield
                                                    size={32}
                                                    color="gray"
                                                />
                                            </Tooltip>
                                        ) : (
                                            <></>
                                        )}
                                    </Localizer>
                                </div>
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
                </div>
            </Modal>
        );
    },
);
