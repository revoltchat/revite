import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Message, SYSTEM_USER_ID, User } from "revolt.js";
import { Users } from "revolt.js/dist/api/objects";
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
        if (msg.author === client.user!._id) return;
        if (msg.channel === channel_id && document.hasFocus()) return;
        if (client.user!.status?.presence === Users.Presence.Busy) return;

        const channel = client.channels.get(msg.channel);
        const author = client.users.get(msg.author);
        if (!channel) return;
        if (author?.relationship === Users.Relationship.Blocked) return;

        const notifState = getNotificationState(notifs, channel);
        if (!shouldNotify(notifState, msg, client.user!._id)) return;

        playSound("message");
        if (!showNotification) return;

        let title;
        switch (channel.channel_type) {
            case "SavedMessages":
                return;
            case "DirectMessage":
                title = `@${author?.username}`;
                break;
            case "Group":
                if (author?._id === SYSTEM_USER_ID) {
                    title = channel.name;
                } else {
                    title = `@${author?.username} - ${channel.name}`;
                }
                break;
            case "TextChannel":
                const server = client.servers.get(channel.server);
                title = `@${author?.username} (#${channel.name}, ${server?.name})`;
                break;
            default:
                title = msg.channel;
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
            icon = client.users.getAvatarURL(msg.author, { max_side: 256 });
        } else {
            const users = client.users;
            switch (msg.content.type) {
                case "user_added":
                case "user_remove":
                    body = translate(
                        `app.main.channel.system.${
                            msg.content.type === "user_added"
                                ? "added_by"
                                : "removed_by"
                        }`,
                        {
                            user: users.get(msg.content.id)?.username,
                            other_user: users.get(msg.content.by)?.username,
                        },
                    );
                    icon = client.users.getAvatarURL(msg.content.id, {
                        max_side: 256,
                    });
                    break;
                case "user_joined":
                case "user_left":
                case "user_kicked":
                case "user_banned":
                    body = translate(
                        `app.main.channel.system.${msg.content.type}`,
                        { user: users.get(msg.content.id)?.username },
                    );
                    icon = client.users.getAvatarURL(msg.content.id, {
                        max_side: 256,
                    });
                    break;
                case "channel_renamed":
                    body = translate(
                        `app.main.channel.system.channel_renamed`,
                        {
                            user: users.get(msg.content.by)?.username,
                            name: msg.content.name,
                        },
                    );
                    icon = client.users.getAvatarURL(msg.content.by, {
                        max_side: 256,
                    });
                    break;
                case "channel_description_changed":
                case "channel_icon_changed":
                    body = translate(
                        `app.main.channel.system.${msg.content.type}`,
                        { user: users.get(msg.content.by)?.username },
                    );
                    icon = client.users.getAvatarURL(msg.content.by, {
                        max_side: 256,
                    });
                    break;
            }
        }

        const notif = await createNotification(title, {
            icon,
            image,
            body,
            timestamp: decodeTime(msg._id),
            tag: msg.channel,
            badge: "/assets/icons/android-chrome-512x512.png",
            silent: true,
        });

        if (notif) {
            notif.addEventListener("click", () => {
                window.focus();
                const id = msg.channel;
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

            notifications[msg.channel] = notif;
            notif.addEventListener(
                "close",
                () => delete notifications[msg.channel],
            );
        }
    }

    async function relationship(user: User, property: string) {
        if (client.user?.status?.presence === Users.Presence.Busy) return;
        if (property !== "relationship") return;
        if (!showNotification) return;

        let event;
        switch (user.relationship) {
            case Users.Relationship.Incoming:
                event = translate("notifications.sent_request", {
                    person: user.username,
                });
                break;
            case Users.Relationship.Friend:
                event = translate("notifications.now_friends", {
                    person: user.username,
                });
                break;
            default:
                return;
        }

        const notif = await createNotification(event, {
            icon: client.users.getAvatarURL(user._id, { max_side: 256 }),
            badge: "/assets/icons/android-chrome-512x512.png",
            timestamp: +new Date(),
        });

        notif?.addEventListener("click", () => {
            history.push(`/friends`);
        });
    }

    useEffect(() => {
        client.addListener("message", message);
        client.users.addListener("mutation", relationship);

        return () => {
            client.removeListener("message", message);
            client.users.removeListener("mutation", relationship);
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
