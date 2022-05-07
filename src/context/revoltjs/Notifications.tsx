import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Message, User } from "revolt.js";
import { decodeTime } from "ulid";

import { useCallback, useContext, useEffect } from "preact/hooks";

import { useTranslation } from "../../lib/i18n";

import { useApplicationState } from "../../mobx/State";

import { AppContext } from "./RevoltClient";

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

function Notifier() {
    const translate = useTranslation();
    const state = useApplicationState();
    const notifs = state.notifications;
    const showNotification = state.settings.get("notifications:desktop");

    const client = useContext(AppContext);
    const { guild: guild_id, channel: channel_id } = useParams<{
        guild: string;
        channel: string;
    }>();
    const history = useHistory();

    const message = useCallback(
        async (msg: Message) => {
            if (msg.channel_id === channel_id && document.hasFocus()) return;
            if (!notifs.shouldNotify(msg)) return;

            state.settings.sounds.playSound("message");
            if (!showNotification) return;

            const effectiveName = msg.masquerade?.name ?? msg.author?.username;

            let title;
            switch (msg.channel?.channel_type) {
                case "SavedMessages":
                    return;
                case "DirectMessage":
                    title = `@${effectiveName}`;
                    break;
                case "Group":
                    if (msg.author?._id === "00000000000000000000000000") {
                        title = msg.channel.name;
                    } else {
                        title = `@${effectiveName} - ${msg.channel.name}`;
                    }
                    break;
                case "TextChannel":
                    title = `@${effectiveName} (#${msg.channel.name}, ${msg.channel.server?.name})`;
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
            if (msg.content) {
                body = client.markdownToText(msg.content);

                if (msg.masquerade?.avatar) {
                    icon = client.proxyFile(msg.masquerade.avatar);
                } else {
                    icon = msg.author?.generateAvatarURL({ max_side: 256 });
                }
            } else if (msg.system) {
                const users = client.users;

                switch (msg.system.type) {
                    case "user_added":
                    case "user_remove":
                        {
                            const user = users.get(msg.system.id);
                            body = translate(
                                `app.main.channel.system.${
                                    msg.system.type === "user_added"
                                        ? "added_by"
                                        : "removed_by"
                                }`,
                                {
                                    user: user?.username,
                                    other_user: users.get(msg.system.by)
                                        ?.username,
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
                            const user = users.get(msg.system.id);
                            body = translate(
                                `app.main.channel.system.${msg.system.type}`,
                                { user: user?.username },
                            );
                            icon = user?.generateAvatarURL({
                                max_side: 256,
                            });
                        }
                        break;
                    case "channel_renamed":
                        {
                            const user = users.get(msg.system.by);
                            body = translate(
                                `app.main.channel.system.channel_renamed`,
                                {
                                    user: users.get(msg.system.by)?.username,
                                    name: msg.system.name,
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
                            const user = users.get(msg.system.by);
                            body = translate(
                                `app.main.channel.system.${msg.system.type}`,
                                { user: users.get(msg.system.by)?.username },
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
                                    `/server/${channel.server_id}/channel/${id}`,
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
        },
        [
            history,
            showNotification,
            translate,
            channel_id,
            client,
            notifs,
            state,
        ],
    );

    const relationship = useCallback(
        async (user: User) => {
            if (client.user?.status?.presence === "Busy") return;
            if (!showNotification) return;

            let event;
            switch (user.relationship) {
                case "Incoming":
                    event = translate("notifications.sent_request", {
                        person: user.username,
                    });
                    break;
                case "Friend":
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
        },
        [client.user?.status?.presence, history, showNotification, translate],
    );

    useEffect(() => {
        client.addListener("message", message);
        client.addListener("user/relationship", relationship);

        return () => {
            client.removeListener("message", message);
            client.removeListener("user/relationship", relationship);
        };
    }, [
        client,
        state,
        guild_id,
        channel_id,
        showNotification,
        notifs,
        message,
        relationship,
    ]);

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

export default function NotificationsComponent() {
    return (
        <Switch>
            <Route path="/server/:server/channel/:channel">
                <Notifier />
            </Route>
            <Route path="/channel/:channel">
                <Notifier />
            </Route>
            <Route path="/">
                <Notifier />
            </Route>
        </Switch>
    );
}
