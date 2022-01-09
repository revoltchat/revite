import {
    action,
    computed,
    makeAutoObservable,
    observable,
    ObservableMap,
} from "mobx";

import { Inputs, useEffect } from "preact/hooks";

import { internalSubscribe } from "../../lib/eventEmitter";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

/** Actions that keybinds can bind to */
export enum Keybinding {
    // Navigation
    NavigateChannelUp = "navigate_channel_up",
    NavigateChannelDown = "navigate_channel_down",
    NavigateServerUp = "navigate_server_up",
    NavigateServerDown = "navigate_server_down",
}

/**
 * A map of the default built-in keybinds.
 * every action must be represented.
 */
export const DEFAULT_KEYBINDS = new Map([
    [Keybinding.NavigateChannelUp, ["Alt+ArrowUp"]],
    [Keybinding.NavigateChannelDown, ["Alt+ArrowDown"]],
    [Keybinding.NavigateServerUp, ["Ctrl+Alt+ArrowUp"]],
    [Keybinding.NavigateServerDown, ["Ctrl+Alt+ArrowDown"]],
]);

export interface Data {
    keybinds: Record<Keybinding, string[]>;
}

/**
 * Handles adding, remove, and fetching keybinds.
 */
export default class Keybinds implements Store, Persistent<Data> {
    keybinds: ObservableMap<Keybinding, string[]>;

    /**
     * Construct new Keybinds store.
     */
    constructor() {
        // If any are not defined here, things will break.
        this.keybinds = observable.map(DEFAULT_KEYBINDS);
        makeAutoObservable(this);
    }

    get id() {
        return "keybinds";
    }

    /** Get the default built-in keybind of an action */
    getDefault(action: Keybinding, index: number) {
        return DEFAULT_KEYBINDS.get(action)?.[index];
    }

    // disableAction action
    // disables an active keybind from without removing it
    // useful for the keybindings setting where disabling all keybinds may be a good idea

    // enableAction action
    // enables a disabled keybind

    // useAction action, fn, inputs
    // listen to an actions events

    toJSON() {
        return {
            keybinds: this.keybinds.toJSON(),
        };
    }

    @action
    hydrate(data: Data) {
        this.keybinds.merge(data.keybinds);
    }

    /**
     * Get a list of keybind expressions for a given action.
     * @param action The action to get the keybinds for
     */
    @computed
    getKeybinds(action: Keybinding) {
        return this.keybinds.get(action)!;
    }

    @action
    setKeybind(action: Keybinding, index: number, sequence: string) {
        this.keybinds.get(action)![index] = sequence;
    }

    @action
    addKeybind(action: Keybinding, sequence: string) {
        this.keybinds.get(action)!.push(sequence);
    }

    /**
     * Resets a keybind back to the built-in default.
     * If there is none, remove it from the list of keybinds for the given action.
     */
    @action
    resetToDefault(action: Keybinding, index: number) {
        const keybinds = this.keybinds.get(action)!;
        const defaultValue = this.getDefault(action, index);
        if (defaultValue) {
            keybinds[index] = defaultValue;
        } else {
            keybinds.splice(index, 1);
        }
    }

    /** Reset and set all keybinds back to default. */
    @action
    reset() {
        this.keybinds.replace(DEFAULT_KEYBINDS);
    }
}

// naming:
// modifiers + key is a combo
// a sequence of combos is a sequence (also called a keybind)

/**
 * Keys that must be pressed at the same time, order should not matter.
 * Should only be include modifiers and one key at the moment.
 */
export type KeyCombo = string[];

export const KeybindSequence = {
    /**
     * Parse a stringified keybind seqeuence.
     *
     * @example
     * ```
     * parse('Alt+ArrowUp')
     * parse('Control+k b')
     * ```
     */
    parse(sequence: string) {
        return sequence.split(" ").map((expr) => expr.split("+"));
    },

    /** Stringify a keybind sequence */
    stringify(sequence: KeyCombo[]) {
        return sequence.map((combo) => combo.join("+")).join(" ");
    },
};
