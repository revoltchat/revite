import { action, computed, makeAutoObservable, ObservableMap } from "mobx";

import Persistent from "../interfaces/Persistent";

interface Data {
    lastSection?: "home" | "server";
    lastHomePath?: string;
    lastOpened?: Record<string, string>;
    openSections?: Record<string, boolean>;
}

/**
 * Keeps track of the last open channels, tabs, etc.
 * Handles providing good UX experience on navigating
 * back and forth between different parts of the app.
 */
export default class Layout implements Persistent<Data> {
    /**
     * The last 'major section' that the user had open.
     * This is either the home tab or a channel ID (for a server channel).
     */
    private lastSection: "home" | string;

    /**
     * The last path the user had open in the home tab.
     */
    private lastHomePath: string;

    /**
     * Map of last channels viewed in servers.
     */
    private lastOpened: ObservableMap<string, string>;

    /**
     * Map of section IDs to their current state.
     */
    private openSections: ObservableMap<string, boolean>;

    /**
     * Construct new Layout store.
     */
    constructor() {
        this.lastSection = "home";
        this.lastHomePath = "/";
        this.lastOpened = new ObservableMap();
        this.openSections = new ObservableMap();
        makeAutoObservable(this);
    }

    toJSON() {
        return {
            lastSection: this.lastSection,
            lastHomePath: this.lastHomePath,
            lastOpened: this.lastOpened,
            openSections: this.openSections,
        };
    }

    @action hydrate(data: Data) {
        if (data.lastSection) {
            this.lastSection = data.lastSection;
        }

        if (data.lastHomePath) {
            this.lastHomePath = data.lastHomePath;
        }

        if (data.lastOpened) {
            Object.keys(data.lastOpened).forEach((key) =>
                this.lastOpened.set(key, data.lastOpened![key]),
            );
        }

        if (data.openSections) {
            Object.keys(data.openSections).forEach((key) =>
                this.openSections.set(key, data.openSections![key]),
            );
        }
    }

    /**
     * Get the last 'major section' the user had open.
     * @returns Last open section
     */
    @computed getLastSection() {
        return this.lastSection;
    }

    /**
     * Get last opened channel in a server.
     * @param server Server ID
     */
    @computed getLastOpened(server: string) {
        return this.lastOpened.get(server);
    }

    /**
     * Get the path to a server (as seen on sidebar).
     * @param server Server ID
     * @returns Pathname
     */
    @computed getServerPath(server: string) {
        let path = `/server/${server}`;
        if (this.lastOpened.has(server)) {
            path += `/channel/${this.getLastOpened(server)}`;
        }

        return path;
    }

    /**
     * Set last opened channel in a server.
     * @param server Server ID
     * @param channel Channel ID
     */
    @action setLastOpened(server: string, channel: string) {
        this.lastOpened.set(server, channel);
        this.lastSection = "server";
    }

    /**
     * Get the last path the user had open in the home tab.
     * @returns Last home path
     */
    @computed getLastHomePath() {
        return this.lastHomePath;
    }

    /**
     * Set the current path open in the home tab.
     * @param path Pathname
     */
    @action setLastHomePath(path: string) {
        this.lastHomePath = path;
        this.lastSection = "home";
    }

    /**
     *
     * @param id Section ID
     * @returns Whether the section is open
     * @param def Default state value
     */
    @computed getSectionState(id: string, def?: boolean) {
        return this.openSections.get(id) ?? def ?? false;
    }

    /**
     * Set the state of a section.
     * @param id Section ID
     * @param value New state value
     * @param def Default state value
     */
    @action setSectionState(id: string, value: boolean, def?: boolean) {
        if (value === def) {
            this.openSections.delete(id);
        } else {
            this.openSections.set(id, value);
        }
    }
}
