import { action, computed, makeAutoObservable, ObservableSet } from "mobx";

import {
    setOfflineSkipEnabled,
    resetMemberSidebarFetched,
} from "../../components/navigation/right/MemberSidebar";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

/**
 * Union type of available experiments.
 */
export type Experiment = "dummy" | "offline_users" | "plugins" | "admin_beta";

/**
 * Currently active experiments.
 */
export const AVAILABLE_EXPERIMENTS: Experiment[] = [
    "dummy",
    "offline_users",
    "plugins",
    "admin_beta",
];

/**
 * Definitions for experiments listed by {@link Experiment}.
 */
export const EXPERIMENTS: {
    [key in Experiment]: { title: string; description: string };
} = {
    dummy: {
        title: "Placeholder Experiment",
        description: "This is a placeholder experiment.",
    },
    offline_users: {
        title: "Re-enable offline users in large servers (>10k members)",
        description:
            "If you can take the performance hit - for example, if you're on desktop - you can re-enable offline users for big servers such as the Revolt Lounge.",
    },
    plugins: {
        title: "Experimental Plugin API",
        description:
            "This will enable the experimental plugin API. Only touch this if you know what you're doing.",
    },
    admin_beta: {
        title: "Admin Panel Shortcuts",
        description:
            "Adds context menu entries to quickly jump to Revolt Admin Panel. This is intended for use by the team.",
    },
};

export interface Data {
    enabled?: Experiment[];
}

/**
 * Handles enabling and disabling client experiments.
 */
export default class Experiments implements Store, Persistent<Data> {
    private enabled: ObservableSet<Experiment>;

    /**
     * Construct new Experiments store.
     */
    constructor() {
        this.enabled = new ObservableSet();
        makeAutoObservable(this);
    }

    get id() {
        return "experiments";
    }

    toJSON() {
        return {
            enabled: [...this.enabled],
        };
    }

    @action hydrate(data: Data) {
        if (data.enabled) {
            for (const experiment of data.enabled) {
                this.enable(experiment as Experiment);
            }
        }
    }

    /**
     * Check if an experiment is enabled.
     * @param experiment Experiment
     */
    @computed isEnabled(experiment: Experiment) {
        return this.enabled.has(experiment);
    }

    /**
     * Enable an experiment.
     * @param experiment Experiment
     */
    @action enable(experiment: Experiment) {
        if (experiment === "offline_users") {
            setOfflineSkipEnabled(false);
            resetMemberSidebarFetched();
        }

        this.enabled.add(experiment);
    }

    /**
     * Disable an experiment.
     * @param experiment Experiment
     */
    @action disable(experiment: Experiment) {
        if (experiment === "offline_users") setOfflineSkipEnabled(true);

        this.enabled.delete(experiment);
    }

    /**
     * Set the state of an experiment.
     * @param key Experiment
     * @param enabled Whether this experiment is enabled.
     */
    @computed setEnabled(key: Experiment, enabled: boolean): void {
        if (enabled) {
            this.enable(key);
        } else {
            this.disable(key);
        }
    }

    /**
     * Reset and disable all experiments.
     */
    @action reset() {
        this.enabled.clear();
    }
}
