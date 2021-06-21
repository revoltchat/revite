import { decodeTime } from "ulid";
import { AppContext } from "./RevoltClient";
import { Users } from "revolt.js/dist/api/objects";
import { useContext, useEffect } from "preact/hooks";
import { IntlContext, translate } from "preact-i18n";
import { connectState } from "../../redux/connector";
import { playSound } from "../../assets/sounds/Audio";
import { Message, SYSTEM_USER_ID, User } from "revolt.js";
import { NotificationOptions } from "../../redux/reducers/settings";
import { Route, Switch, useHistory, useParams } from "react-router-dom";

interface Props {
    options?: NotificationOptions;
}

const notifications: { [key: string]: Notification } = {};

async function createNotification(title: string, options: globalThis.NotificationOptions) {
    try {
        return new Notification(title, options);
    } catch (err) {
        let sw = await navigator.serviceWorker.getRegistration();
        sw?.showNotification(title, options);
    }
}

function Notifier(props: Props) {
    const { intl } = useContext(IntlContext) as any;
    const showNotification = props.options?.desktopEnabled ?? false;
    // const playIncoming = props.options?.soundEnabled ?? true;
    // const playOutgoing = props.options?.outgoingSoundEnabled ?? true;

    const client = useContext(AppContext);
    const { guild: guild_id, channel: channel_id } = useParams<{
        guild: string;
        channel: string;
    }>();
    const history = useHistory();

    async function message(msg: Message) {
        if (msg.author === client.user!._id) return;
        if (msg.channel === channel_id && document.hasFocus()) return;
        if (client.user?.status?.presence === Users.Presence.Busy) return;

        // Sounds.playInbound();
        playSound('message');
        if (!showNotification) return;

        const channel = client.channels.get(msg.channel);
        const author = client.users.get(msg.author);
        if (author?.relationship === Users.Relationship.Blocked) return;

        let title;
        switch (channel?.channel_type) {
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
            let imageAttachment = msg.attachments.find(x => x.metadata.type === 'Image');
            if (imageAttachment) {
                image = client.generateFileURL(imageAttachment, { max_side: 720 });
            }
        }

        let body, icon;
        if (typeof msg.content === "string") {
            body = client.markdownToText(msg.content);
            icon = client.users.getAvatarURL(msg.author, { max_side: 256 });
        } else {
            let users = client.users;
            switch (msg.content.type) {
                // ! FIXME: update to support new replacements
                case "user_added":
                    body = `${users.get(msg.content.id)?.username} ${translate(
                        "app.main.channel.system.user_joined",
                        "",
                        intl.dictionary
                    )} (${translate(
                        "app.main.channel.system.added_by",
                        "",
                        intl.dictionary
                    )} ${users.get(msg.content.by)?.username})`;
                    icon = client.users.getAvatarURL(msg.content.id, { max_side: 256 });
                    break;
                case "user_remove":
                    body = `${users.get(msg.content.id)?.username} ${translate(
                        "app.main.channel.system.user_left",
                        "",
                        intl.dictionary
                    )} (${translate(
                        "app.main.channel.system.added_by",
                        "",
                        intl.dictionary
                    )} ${users.get(msg.content.by)?.username})`;
                    icon = client.users.getAvatarURL(msg.content.id, { max_side: 256 });
                    break;
                case "user_left":
                    body = `${users.get(msg.content.id)?.username} ${translate(
                        "app.main.channel.system.user_left",
                        "",
                        intl.dictionary
                    )}`;
                    icon = client.users.getAvatarURL(msg.content.id, { max_side: 256 });
                    break;
                case "channel_renamed":
                    body = `${users.get(msg.content.by)?.username} ${translate(
                        "app.main.channel.system.channel_renamed",
                        "",
                        intl.dictionary
                    )} ${msg.content.name}`;
                    icon = client.users.getAvatarURL(msg.content.by, { max_side: 256 });
                    break;
            }
        }

        let notif = await createNotification(title, {
            icon,
            image,
            body,
            timestamp: decodeTime(msg._id),
            tag: msg.channel,
            badge: '/assets/icons/android-chrome-512x512.png',
            silent: true
        });

        if (notif) {
            notif.addEventListener("click", () => {
                const id = msg.channel;
                if (id !== channel_id) {
                    let channel = client.channels.get(id);
                    if (channel) {
                        if (channel.channel_type === 'TextChannel') {
                            history.push(`/server/${channel.server}/channel/${id}`);
                        } else {
                            history.push(`/channel/${id}`);
                        }
                    }
                }
            });

            notifications[msg.channel] = notif;
            notif.addEventListener(
                "close",
                () => delete notifications[msg.channel]
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
                event = translate(
                    "notifications.sent_request",
                    "",
                    intl.dictionary,
                    { person: user.username }
                );
                break;
            case Users.Relationship.Friend:
                event = translate(
                    "notifications.now_friends",
                    "",
                    intl.dictionary,
                    { person: user.username }
                );
                break;
            default:
                return;
        }

        let notif = await createNotification(event, {
            icon: client.users.getAvatarURL(user._id, { max_side: 256 }),
            badge: '/assets/icons/android-chrome-512x512.png',
            timestamp: +new Date()
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
    }, [client, guild_id, channel_id, showNotification]);

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

    return <></>;
}

const NotifierComponent = connectState(
    Notifier,
    state => {
        return {
            options: state.settings.notification
        };
    },
    true
);

export default function Notifications() {
    return (
        <Switch>
            <Route path="/channel/:channel">
                <NotifierComponent />
            </Route>
            <Route path="/">
                <NotifierComponent />
            </Route>
        </Switch>
    );
}
