import { makeAutoObservable, computed, action } from "mobx";

import Settings from "../Settings";

/**
 * Helper class for changing security options.
 */
export default class SSecurity {
    private settings: Settings;

    /**
     * Construct a new security helper.
     * @param settings Settings parent class
     */
    constructor(settings: Settings) {
        this.settings = settings;
        makeAutoObservable(this);
    }

    @action addTrustedOrigin(origin: string) {
        this.settings.set("security:trustedOrigins", [
            ...(this.settings.get("security:trustedOrigins") ?? []).filter(
                (x) => x !== origin,
            ),
            origin,
        ]);
    }

    @computed isTrustedOrigin(origin: string) {
        console.log(this.settings.get("security:trustedOrigins"), origin);
        return this.settings.get("security:trustedOrigins")?.includes(origin);
    }
}
