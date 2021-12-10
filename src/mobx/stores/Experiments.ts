import { action, computed, makeAutoObservable, ObservableSet } from "mobx";

import Persistent from "../Persistent";

export type Experiment = "search" | "theme_shop";

export const AVAILABLE_EXPERIMENTS: Experiment[] = ["theme_shop"];

export const EXPERIMENTS: {
    [key in Experiment]: { title: string; description: string };
} = {
    search: {
        title: "Search",
        description: "Allows you to search for messages in channels.",
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

    // eslint-disable-next-line require-jsdoc
    toJSON() {
        return {
            enabled: this.enabled,
        };
    }

    // eslint-disable-next-line require-jsdoc
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
     * Reset and disable all experiments.
     */
    @action reset() {
        this.enabled.clear();
    }
}
