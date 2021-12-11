import { action, computed, makeAutoObservable, ObservableSet } from "mobx";

import Persistent from "../interfaces/Persistent";

/**
 * Union type of available experiments.
 */
export type Experiment = "dummy" | "theme_shop";

/**
 * Currently active experiments.
 */
export const AVAILABLE_EXPERIMENTS: Experiment[] = ["dummy", "theme_shop"];

/**
 * Definitions for experiments listed by {@link Experiment}.
 */
export const EXPERIMENTS: {
    [key in Experiment]: { title: string; description: string };
} = {
    dummy: {
        title: "Dummy Experiment",
        description: "This is a dummy experiment.",
    },
    theme_shop: {
        title: "Theme Shop",
        description: "Allows you to access and set user submitted themes.",
    },
};

interface Data {
    enabled?: Experiment[];
}

/**
 * Handles enabling and disabling client experiments.
 */
export default class Experiments implements Persistent<Data> {
    private enabled: ObservableSet<Experiment>;

    /**
     * Construct new Experiments store.
     */
    constructor() {
        this.enabled = new ObservableSet();
        makeAutoObservable(this);
    }

    toJSON() {
        return {
            enabled: this.enabled,
        };
    }

    @action hydrate(data: Data) {
        if (data.enabled) {
            for (const experiment of data.enabled) {
                this.enabled.add(experiment as Experiment);
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
        this.enabled.add(experiment);
    }

    /**
     * Disable an experiment.
     * @param experiment Experiment
     */
    @action disable(experiment: Experiment) {
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
