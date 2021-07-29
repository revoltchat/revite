import isEqual from "lodash.isequal";
import {
    makeAutoObservable,
    observable,
    autorun,
    runInAction,
    reaction,
    makeObservable,
    action,
    extendObservable,
} from "mobx";
import { Attachment, Channels, Users } from "revolt.js/dist/api/objects";
import { RemoveChannelField, RemoveUserField } from "revolt.js/dist/api/routes";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

type Nullable<T> = T | null;
function toNullable<T>(data?: T) {
    return typeof data === "undefined" ? null : data;
}

export class User {
    _id: string;
    username: string;

    avatar: Nullable<Attachment>;
    badges: Nullable<number>;
    status: Nullable<Users.Status>;
    relationship: Nullable<Users.Relationship>;
    online: Nullable<boolean>;

    constructor(data: Users.User) {
        this._id = data._id;
        this.username = data.username;

        this.avatar = toNullable(data.avatar);
        this.badges = toNullable(data.badges);
        this.status = toNullable(data.status);
        this.relationship = toNullable(data.relationship);
        this.online = toNullable(data.online);

        makeAutoObservable(this);
    }

    @action update(data: Partial<Users.User>, clear?: RemoveUserField) {
        const apply = (key: string) => {
            // This code has been tested.
            // @ts-expect-error
            if (data[key] && !isEqual(this[key], data[key])) {
                // @ts-expect-error
                this[key] = data[key];
            }
        };

        switch (clear) {
            case "Avatar":
                this.avatar = null;
                break;
            case "StatusText": {
                if (this.status) {
                    this.status.text = undefined;
                }
            }
        }

        apply("username");
        apply("avatar");
        apply("badges");
        apply("status");
        apply("relationship");
        apply("online");
    }
}

export class Channel {
    _id: string;
    channel_type: Channels.Channel["channel_type"];

    // Direct Message
    active: Nullable<boolean> = null;

    // Group
    owner: Nullable<string> = null;

    // Server
    server: Nullable<string> = null;

    // Permissions
    permissions: Nullable<number> = null;
    default_permissions: Nullable<number> = null;
    role_permissions: Nullable<{ [key: string]: number }> = null;

    // Common
    name: Nullable<string> = null;
    icon: Nullable<Attachment> = null;
    description: Nullable<string> = null;
    recipients: Nullable<string[]> = null;
    last_message: Nullable<string | Channels.LastMessage> = null;

    constructor(data: Channels.Channel) {
        this._id = data._id;
        this.channel_type = data.channel_type;

        switch (data.channel_type) {
            case "DirectMessage": {
                this.active = toNullable(data.active);
                this.recipients = toNullable(data.recipients);
                this.last_message = toNullable(data.last_message);
                break;
            }
            case "Group": {
                this.recipients = toNullable(data.recipients);
                this.name = toNullable(data.name);
                this.owner = toNullable(data.owner);
                this.description = toNullable(data.description);
                this.last_message = toNullable(data.last_message);
                this.icon = toNullable(data.icon);
                this.permissions = toNullable(data.permissions);
                break;
            }
            case "TextChannel":
            case "VoiceChannel": {
                this.server = toNullable(data.server);
                this.name = toNullable(data.name);
                this.description = toNullable(data.description);
                this.icon = toNullable(data.icon);
                this.default_permissions = toNullable(data.default_permissions);
                this.role_permissions = toNullable(data.role_permissions);

                if (data.channel_type === "TextChannel") {
                    this.last_message = toNullable(data.last_message);
                }

                break;
            }
        }

        makeAutoObservable(this);
    }

    @action update(
        data: Partial<Channels.Channel>,
        clear?: RemoveChannelField,
    ) {
        const apply = (key: string) => {
            // This code has been tested.
            // @ts-expect-error
            if (data[key] && !isEqual(this[key], data[key])) {
                // @ts-expect-error
                this[key] = data[key];
            }
        };

        switch (clear) {
            case "Description":
                this.description = null;
                break;
            case "Icon":
                this.icon = null;
                break;
        }

        apply("active");
        apply("owner");
        apply("permissions");
        apply("default_permissions");
        apply("role_permissions");
        apply("name");
        apply("icon");
        apply("description");
        apply("recipients");
        apply("last_message");
    }
}

export class DataStore {
    @observable users = new Map<string, User>();
    @observable channels = new Map<string, Channel>();

    constructor() {
        makeAutoObservable(this);
    }

    @action
    packet(packet: ClientboundNotification) {
        switch (packet.type) {
            case "Ready": {
                for (let user of packet.users) {
                    this.users.set(user._id, new User(user));
                }

                for (let channel of packet.channels) {
                    this.channels.set(channel._id, new Channel(channel));
                }

                break;
            }
            case "UserUpdate": {
                this.users.get(packet.id)?.update(packet.data, packet.clear);
                break;
            }
        }
    }
}
