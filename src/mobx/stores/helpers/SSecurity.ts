import { makeAutoObservable, computed, action } from "mobx";

import Settings from "../Settings";

const TRUSTED_DOMAINS = ["revolt.chat", "revolt.wtf", "gifbox.me", "rvlt.gg"];

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
        if (TRUSTED_DOMAINS.find((x) => origin.endsWith(x))) {
            return true;
        }

        return this.settings.get("security:trustedOrigins")?.includes(origin);
    }
}
