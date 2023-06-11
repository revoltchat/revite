import { action, makeAutoObservable, runInAction } from "mobx";

import { changelogEntries, latestChangelog } from "../../assets/changelogs";
import { modalController } from "../../controllers/modals/ModalController";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";
import Syncable from "../interfaces/Syncable";

export interface Data {
    viewed?: number;
}

/**
 * Keeps track of viewed changelog items
 */
export default class Changelog implements Store, Persistent<Data>, Syncable {
    /**
     * Last viewed changelog ID
     */
    private viewed: number;

    /**
     * Construct new Layout store.
     */
    constructor() {
        this.viewed = 0;
        makeAutoObservable(this);
    }

    get id() {
        return "changelog";
    }

    toJSON() {
        return {
            viewed: this.viewed,
        };
    }

    @action hydrate(data: Data) {
        if (data.viewed) {
            this.viewed = data.viewed;
        }
    }

    apply(_key: string, data: unknown, _revision: number): void {
        this.hydrate(data as Data);
    }

    toSyncable(): { [key: string]: object } {
        return {
            changelog: this.toJSON(),
        };
    }

    /**
     * Check whether there are new updates
     */
    checkForUpdates() {
        if (this.viewed < latestChangelog) {
            const expires = new Date(+changelogEntries[latestChangelog].date);
            expires.setDate(expires.getDate() + 7);

            if (+new Date() < +expires) {
                if (latestChangelog === 3) {
                    modalController.push({
                        type: "changelog_usernames",
                    });
                } else {
                    modalController.push({
                        type: "changelog",
                        initial: latestChangelog,
                    });
                }
            }

            runInAction(() => {
                this.viewed = latestChangelog;
            });
        }
    }
}
