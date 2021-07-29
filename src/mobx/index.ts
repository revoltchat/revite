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
import { Attachment, Users } from "revolt.js/dist/api/objects";
import { RemoveUserField } from "revolt.js/dist/api/routes";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

type Nullable<T> = T | null;
function toNullable<T>(data?: T) {
    return typeof data === "undefined" ? null : data;
}

class User {
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
        const apply = (key: keyof Users.User) => {
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

        apply("avatar");
        apply("badges");
        apply("status");
        apply("relationship");
        apply("online");
    }
}

export class DataStore {
    @observable users = new Map<string, User>();

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
                break;
            }
            case "UserUpdate": {
                this.users.get(packet.id)?.update(packet.data, packet.clear);
                break;
            }
        }
    }
}
