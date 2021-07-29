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
import { Client } from "revolt.js";
import {
    Attachment,
    Channels,
    Servers,
    Users,
} from "revolt.js/dist/api/objects";
import {
    RemoveChannelField,
    RemoveMemberField,
    RemoveServerField,
    RemoveUserField,
} from "revolt.js/dist/api/routes";
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

    @action setRelationship(relationship: Users.Relationship) {
        this.relationship = relationship;
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

    @action groupJoin(user: string) {
        this.recipients?.push(user);
    }

    @action groupLeave(user: string) {
        this.recipients = toNullable(
            this.recipients?.filter((x) => x !== user),
        );
    }
}

export class Server {
    _id: string;
    owner: string;
    name: string;
    description: Nullable<string> = null;

    channels: string[] = [];
    categories: Nullable<Servers.Category[]> = null;
    system_messages: Nullable<Servers.SystemMessageChannels> = null;

    roles: Nullable<{ [key: string]: Servers.Role }> = null;
    default_permissions: Servers.PermissionTuple;

    icon: Nullable<Attachment> = null;
    banner: Nullable<Attachment> = null;

    constructor(data: Servers.Server) {
        this._id = data._id;
        this.owner = data.owner;
        this.name = data.name;
        this.description = toNullable(data.description);

        this.channels = data.channels;
        this.categories = toNullable(data.categories);
        this.system_messages = toNullable(data.system_messages);

        this.roles = toNullable(data.roles);
        this.default_permissions = data.default_permissions;

        this.icon = toNullable(data.icon);
        this.banner = toNullable(data.banner);

        makeAutoObservable(this);
    }

    @action update(data: Partial<Servers.Server>, clear?: RemoveServerField) {
        const apply = (key: string) => {
            // This code has been tested.
            // @ts-expect-error
            if (data[key] && !isEqual(this[key], data[key])) {
                // @ts-expect-error
                this[key] = data[key];
            }
        };

        switch (clear) {
            case "Banner":
                this.banner = null;
                break;
            case "Description":
                this.description = null;
                break;
            case "Icon":
                this.icon = null;
                break;
        }

        apply("owner");
        apply("name");
        apply("description");
        apply("channels");
        apply("categories");
        apply("system_messages");
        apply("roles");
        apply("default_permissions");
        apply("icon");
        apply("banner");
    }
}

export class Member {
    _id: Servers.MemberCompositeKey;
    nickname: Nullable<string> = null;
    avatar: Nullable<Attachment> = null;
    roles: Nullable<string[]> = null;

    constructor(data: Servers.Member) {
        this._id = data._id;
        this.nickname = toNullable(data.nickname);
        this.avatar = toNullable(data.avatar);
        this.roles = toNullable(data.roles);

        makeAutoObservable(this);
    }

    @action update(data: Partial<Servers.Member>, clear?: RemoveMemberField) {
        const apply = (key: string) => {
            // This code has been tested.
            // @ts-expect-error
            if (data[key] && !isEqual(this[key], data[key])) {
                // @ts-expect-error
                this[key] = data[key];
            }
        };

        switch (clear) {
            case "Nickname":
                this.nickname = null;
                break;
            case "Avatar":
                this.avatar = null;
                break;
        }

        apply("nickname");
        apply("avatar");
        apply("roles");
    }
}

export class DataStore {
    client: Client;

    @observable users = new Map<string, User>();
    @observable channels = new Map<string, Channel>();
    @observable servers = new Map<string, Server>();
    @observable members = new Map<Servers.MemberCompositeKey, Member>();

    constructor(client: Client) {
        makeAutoObservable(this, undefined, { proxy: false });
        this.client = client;
    }

    @action
    async packet(packet: ClientboundNotification) {
        switch (packet.type) {
            case "Ready": {
                for (let user of packet.users) {
                    this.users.set(user._id, new User(user));
                }

                for (let channel of packet.channels) {
                    this.channels.set(channel._id, new Channel(channel));
                }

                for (let server of packet.servers) {
                    this.servers.set(server._id, new Server(server));
                }

                break;
            }
            case "ChannelCreate": {
                this.channels.set(packet._id, new Channel(packet));
                break;
            }
            case "ChannelUpdate": {
                this.channels.get(packet.id)?.update(packet.data, packet.clear);
                break;
            }
            case "ChannelDelete": {
                this.channels.delete(packet.id);
                break;
            }
            case "ChannelGroupJoin": {
                this.channels.get(packet.id)?.groupJoin(packet.user);

                if (!this.users.has(packet.user)) {
                    let user = await this.client.users.fetch(packet.user);
                    this.users.set(packet.user, new User(user));
                }

                break;
            }
            case "ChannelGroupLeave": {
                this.channels.get(packet.id)?.groupJoin(packet.user);
                break;
            }
            case "UserUpdate": {
                this.users.get(packet.id)?.update(packet.data, packet.clear);
                break;
            }
            case "UserRelationship": {
                if (!this.users.has(packet.user._id)) {
                    this.users.set(packet.user._id, new User(packet.user));
                }

                this.users.get(packet.user._id)?.setRelationship(packet.status);
                break;
            }
            case "ServerUpdate": {
                this.servers.get(packet.id)?.update(packet.data, packet.clear);
                break;
            }
            case "ServerDelete": {
                let server = this.servers.get(packet.id);
                if (server) {
                    for (let channel of server.channels) {
                        this.channels.delete(channel);
                    }
                }

                this.servers.delete(packet.id);
                break;
            }
            case "ServerMemberUpdate": {
                this.members.get(packet.id)?.update(packet.data, packet.clear);
                break;
            }
            case "ServerMemberJoin": {
                const _id = { server: packet.id, user: packet.user };
                this.members.set(_id, new Member({ _id }));

                if (!this.servers.has(packet.id)) {
                    let server = await this.client.servers.fetch(packet.id);
                    this.servers.set(packet.id, new Server(server));

                    for (let id of server.channels) {
                        let channel = this.client.channels.get(id);
                        if (channel) {
                            this.channels.set(id, new Channel(channel));
                        }
                    }
                }

                if (!this.users.has(packet.user)) {
                    let user = await this.client.users.fetch(packet.user);
                    this.users.set(packet.user, new User(user));
                }

                break;
            }
            case "ServerMemberLeave": {
                this.members.delete({ server: packet.id, user: packet.user });
                if (packet.user === this.client.user!._id) {
                    await this.packet({ type: "ServerDelete", id: packet.id });
                }

                break;
            }
        }
    }

    async fetchMembers(server: string) {
        let res = await this.client.members.fetchMembers(server);

        for (let user of res.users) {
            if (!this.users.has(user._id)) {
                this.users.set(user._id, new User(user));
            }
        }

        return res.members;
    }
}
