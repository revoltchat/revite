import { autorun, reaction } from "mobx";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Presence, RelationshipStatus } from "revolt-api/types/Users";
import { SYSTEM_USER_ID } from "revolt.js";
import { Message } from "revolt.js/dist/maps/Messages";
import { User } from "revolt.js/dist/maps/Users";
import { decodeTime } from "ulid";

import { useContext, useEffect } from "preact/hooks";

import { useTranslation } from "../../lib/i18n";

import { connectState } from "../../redux/connector";
import {
    getNotificationState,
    Notifications,
    shouldNotify,
} from "../../redux/reducers/notifications";
import { NotificationOptions } from "../../redux/reducers/settings";

import { SoundContext } from "../Settings";
import { AppContext } from "./RevoltClient";

interface Props {
    options?: NotificationOptions;
    notifs: Notifications;
}

const notifications: { [key: string]: Notification } = {};

async function createNotification(
    title: string,
    options: globalThis.NotificationOptions,
) {
    try {
        return new Notification(title, options);
    } catch (err) {
        const sw = await navigator.serviceWorker.getRegistration();
        sw?.showNotification(title, options);
    }
}

function Notifier({ options, notifs }: Props) {
    const translate = useTranslation();
    const showNotification = options?.desktopEnabled ?? false;

    const client = useContext(AppContext);
    const { guild: guild_id, channel: channel_id } = useParams<{
        guild: string;
        channel: string;
    }>();
    const history = useHistory();
    const playSound = useContext(SoundContext);

    async function message(msg: Message) {
        if (msg.author_id === client.user!._id) return;
        if (msg.channel_id === channel_id && document.hasFocus()) return;
        if (client.user!.status?.presence === Presence.Busy) return;
        if (msg.author?.relationship === RelationshipStatus.Blocked) return;

        const notifState = getNotificationState(notifs, msg.channel!);
        if (!shouldNotify(notifState, msg, client.user!._id)) return;

        playSound("message");
        if (!showNotification) return;

        let title;
        switch (msg.channel?.channel_type) {
            case "SavedMessages":
                return;
            case "DirectMessage":
                title = `@${msg.author?.username}`;
                break;
            case "Group":
                if (msg.author?._id === SYSTEM_USER_ID) {
                    title = msg.channel.name;
                } else {
                    title = `@${msg.author?.username} - ${msg.channel.name}`;
                }
                break;
            case "TextChannel":
                title = `@${msg.author?.username} (#${msg.channel.name}, ${msg.channel.server?.name})`;
                break;
            default:
                title = msg.channel?._id;
                break;
        }

        let image;
        if (msg.attachments) {
            const imageAttachment = msg.attachments.find(
                (x) => x.metadata.type === "Image",
            );
            if (imageAttachment) {
                image = client.generateFileURL(imageAttachment, {
                    max_side: 720,
                });
            }
        }

        let body, icon;
        if (typeof msg.content === "string") {
            body = client.markdownToText(msg.content);
            icon = msg.author?.generateAvatarURL({ max_side: 256 });
        } else {
            const users = client.users;
            switch (msg.content.type) {
                case "user_added":
                case "user_remove":
                    {
                        let user = users.get(msg.content.id);
                        body = translate(
                            `app.main.channel.system.${
                                msg.content.type === "user_added"
                                    ? "added_by"
                                    : "removed_by"
                            }`,
                            {
                                user: user?.username,
                                other_user: users.get(msg.content.by)?.username,
                            },
                        );
                        icon = user?.generateAvatarURL({
                            max_side: 256,
                        });
                    }
                    break;
                case "user_joined":
                case "user_left":
                case "user_kicked":
                case "user_banned":
                    {
                        let user = users.get(msg.content.id);
                        body = translate(
                            `app.main.channel.system.${msg.content.type}`,
                            { user: user?.username },
                        );
                        icon = user?.generateAvatarURL({
                            max_side: 256,
                        });
                    }
                    break;
                case "channel_renamed":
                    {
                        let user = users.get(msg.content.by);
                        body = translate(
                            `app.main.channel.system.channel_renamed`,
                            {
                                user: users.get(msg.content.by)?.username,
                                name: msg.content.name,
                            },
                        );
                        icon = user?.generateAvatarURL({
                            max_side: 256,
                        });
                    }
                    break;
                case "channel_description_changed":
                case "channel_icon_changed":
                    {
                        let user = users.get(msg.content.by);
                        body = translate(
                            `app.main.channel.system.${msg.content.type}`,
                            { user: users.get(msg.content.by)?.username },
                        );
                        icon = user?.generateAvatarURL({
                            max_side: 256,
                        });
                    }
                    break;
            }
        }

        const notif = await createNotification(title!, {
            icon,
            image,
            body,
            timestamp: decodeTime(msg._id),
            tag: msg.channel?._id,
            badge: "/assets/icons/android-chrome-512x512.png",
            silent: true,
        });

        if (notif) {
            notif.addEventListener("click", () => {
                window.focus();
                const id = msg.channel_id;
                if (id !== channel_id) {
                    const channel = client.channels.get(id);
                    if (channel) {
                        if (channel.channel_type === "TextChannel") {
                            history.push(
                                `/server/${channel.server}/channel/${id}`,
                            );
                        } else {
                            history.push(`/channel/${id}`);
                        }
                    }
                }
            });

            notifications[msg.channel_id] = notif;
            notif.addEventListener(
                "close",
                () => delete notifications[msg.channel_id],
            );
        }
    }

    async function relationship(user: User) {
        if (client.user?.status?.presence === Presence.Busy) return;
        if (!showNotification) return;

        let event;
        switch (user.relationship) {
            case RelationshipStatus.Incoming:
                event = translate("notifications.sent_request", {
                    person: user.username,
                });
                break;
            case RelationshipStatus.Friend:
                event = translate("notifications.now_friends", {
                    person: user.username,
                });
                break;
            default:
                return;
        }

        const notif = await createNotification(event, {
            icon: user.generateAvatarURL({ max_side: 256 }),
            badge: "/assets/icons/android-chrome-512x512.png",
            timestamp: +new Date(),
        });

        notif?.addEventListener("click", () => {
            history.push(`/friends`);
        });
    }

    useEffect(() => {
        client.addListener("message", message);
        client.addListener("user/relationship", relationship);

        return () => {
            client.removeListener("message", message);
            client.removeListener("user/relationship", relationship);
        };
    }, [client, playSound, guild_id, channel_id, showNotification, notifs]);

    useEffect(() => {
        function visChange() {
            if (document.visibilityState === "visible") {
                if (notifications[channel_id]) {
                    notifications[channel_id].close();
                }
            }
        }

        visChange();

        document.addEventListener("visibilitychange", visChange);
        return () =>
            document.removeEventListener("visibilitychange", visChange);
    }, [guild_id, channel_id]);

    return null;
}

const NotifierComponent = connectState(
    Notifier,
    (state) => {
        return {
            options: state.settings.notification,
            notifs: state.notifications,
        };
    },
    true,
);

export default function NotificationsComponent() {
    return (
        <Switch>
            <Route path="/server/:server/channel/:channel">
                <NotifierComponent />
            </Route>
            <Route path="/channel/:channel">
                <NotifierComponent />
            </Route>
            <Route path="/">
                <NotifierComponent />
            </Route>
        </Switch>
    );
}
