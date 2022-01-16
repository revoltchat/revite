import isEqual from "lodash.isequal";
import {
    action,
    computed,
    entries,
    makeAutoObservable,
    observable,
    ObservableMap,
} from "mobx";

import { Inputs, useEffect } from "preact/hooks";

import { debounce } from "../../lib/debounce";
import { internalEmit, internalSubscribe } from "../../lib/eventEmitter";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

/** Actions that keybinds can bind to */
export enum KeybindAction {
    // Navigation
    NavigateChannelUp = "navigate_channel_up",
    NavigateChannelDown = "navigate_channel_down",
    NavigateServerUp = "navigate_server_up",
    NavigateServerDown = "navigate_server_down",

    NavigatePreviousContext = "navigate_previous_context",
    NavigatePreviousContextModal = "navigate_previous_context_modal",
    NavigatePreviousContextSettings = "navigate_previous_context_settings",

    InputSubmit = "input_submit",

    EditPreviousMessage = "edit_previous_message",
}

// If any are not defined here, things may break.
/**
 * A map of the default built-in keybinds.
 * every action must be represented.
 */
export const DEFAULT_KEYBINDS = new Map<KeybindAction, Keybinding[]>([
    [KeybindAction.NavigateChannelUp, [{ sequence: [["Alt", "ArrowUp"]] }]],
    [KeybindAction.NavigateChannelDown, [{ sequence: [["Alt", "ArrowDown"]] }]],
    [
        KeybindAction.NavigateServerUp,
        [{ sequence: [["Control", "Alt", "ArrowUp"]] }],
    ],
    [
        KeybindAction.NavigateServerDown,
        [{ sequence: [["Control", "Alt", "ArrowDown"]] }],
    ],
    [KeybindAction.NavigatePreviousContext, [{ sequence: [["Escape"]] }]],
    [KeybindAction.NavigatePreviousContextModal, [{ sequence: [] }]],
    [KeybindAction.NavigatePreviousContextSettings, [{ sequence: [] }]],

    [KeybindAction.InputSubmit, [{ sequence: [["Enter"]] }]],
    [KeybindAction.EditPreviousMessage, [{ sequence: [["ArrowUp"]] }]],
]);

// naming:
// modifiers + key is a combo
// a sequence of combos is a sequence (also called a keybind)

/**
 * Keys that must be pressed at the same time, order should not matter.
 * Should only be include modifiers and one key at the moment.
 */
export type KeyCombo = string[];

export type KeySequence = KeyCombo[];

export type Keybinding = {
    sequence: KeySequence;
};

export interface Data {
    keybinds: Record<KeybindAction, Keybinding>;
}

/**
 * Handles adding, remove, and fetching keybinds.
 */
export default class Keybinds implements Store, Persistent<Data> {
    keybinds: ObservableMap<KeybindAction, Keybinding[]>;

    possibleSequences = new Map<Keybinding, KeyCombo[]>();

    resetPossibleSequences = () =>
        debounce(() => this.possibleSequences.clear(), 1000);

    handleEvent(event: Event) {
        if (!(event instanceof KeyboardEvent)) return;
        if (event.repeat) return;

        const combo = KeyCombo.fromKeyboardEvent(event);

        this.keybinds.forEach((keybindings, action) => {
            keybindings.forEach((keybinding) => {
                // skip unassigned keybinds
                if (keybinding.sequence.length === 0) return;

                const expectedSequence =
                    this.possibleSequences.get(keybinding) ??
                    keybinding.sequence;

                // todo: add matches function to better handle browser inconsistencies
                const matched = isEqual(expectedSequence[0], combo);

                if (matched) {
                    if (expectedSequence.length > 1) {
                        this.possibleSequences.set(
                            keybinding,
                            expectedSequence.slice(1),
                        );
                    } else {
                        this.possibleSequences.delete(keybinding);
                        internalEmit("action", action, event);
                    }
                } else if (KEYBINDING_MODIFIER_KEYS.includes(event.key)) {
                    this.possibleSequences.delete(keybinding);
                }
            });
        });

        this.resetPossibleSequences();
    }

    /**
     * Construct new Keybinds store.
     */
    constructor() {
        this.keybinds = observable.map(DEFAULT_KEYBINDS);
        makeAutoObservable(this);
    }

    get id() {
        return "keybinds";
    }

    /** Get the default built-in keybind of an action */
    getDefault(action: KeybindAction, index: number) {
        return DEFAULT_KEYBINDS.get(action)?.[index];
    }

    // useAction action, fn, inputs
    // listen to an actions events
    useAction(
        action: KeybindAction,
        cb: (event: KeyboardEvent) => void | boolean,
        inputs?: Inputs,
    ) {
        useEffect(() => internalSubscribe("action", action, cb as any), inputs);
    }

    @computed
    displayKeybind(action: KeybindAction, index: number) {
        return this.keybinds
            .get(action)!
            [index].sequence.map(KeyCombo.stringifyShort);
    }

    @computed
    getKeybindList() {
        return entries(this.keybinds).flatMap(([action, keybinds]) =>
            keybinds.map((keybind) => ({ ...keybind, action })),
        );
    }

    // todo: store keybinds through their stringified representation
    // todo: only save modified keybinds
    toJSON() {
        return {
            keybinds: this.keybinds.toJSON(),
        };
    }

    @action
    hydrate(data: Data) {
        this.keybinds.merge(data.keybinds);
    }

    // todo: findConflicts

    /**
     * Get a list of keybind expressions for a given action.
     * @param action The action to get the keybinds for
     */
    @computed
    getKeybinds(action: KeybindAction) {
        return this.keybinds.get(action)!;
    }

    @action
    setKeybind(action: KeybindAction, index: number, sequence: string) {
        this.keybinds.get(action)![index].sequence =
            KeybindSequence.parse(sequence);
    }

    @action
    addKeybind(action: KeybindAction, sequence: string) {
        this.keybinds
            .get(action)!
            .push({ sequence: KeybindSequence.parse(sequence) });
    }

    /**
     * Resets a keybind back to the built-in default.
     * If there is none, remove it from the list of keybinds for the given action.
     */
    @action
    resetToDefault(action: KeybindAction, index: number) {
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

// note: order dependent!
export const KEYBINDING_MODIFIER_KEYS = ["Control", "Alt", "Meta", "Shift"];

const DISPLAY_SHORT_REPLACEMENTS: Record<string, string> = {
    Control: "Ctrl",
    Escape: "Esc",
};

export const KeyCombo = {
    fromKeyboardEvent(event: KeyboardEvent): KeyCombo {
        const pressed = KEYBINDING_MODIFIER_KEYS.filter(
            (key) => event.getModifierState(key) && event.key,
        );

        if (!KEYBINDING_MODIFIER_KEYS.includes(event.key)) {
            pressed.push(event.key);
        }

        return pressed;
    },

    /**
     * Stringifies a key combo, using shortened key replacements when possible.
     * ex. replacing `Escape` with `Esc`
     */
    stringifyShort(combo: KeyCombo) {
        return combo.map((k) => DISPLAY_SHORT_REPLACEMENTS[k] ?? k);
    },
};

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
    parse(sequence: string): KeyCombo[] {
        return sequence.split(" ").map((expr) => expr.split("+"));
    },

    /** Stringify a keybind sequence */
    stringify(sequence: KeyCombo[]) {
        return sequence.map((combo) => combo.join("+")).join(" ");
    },

    /**
     * Stringifies a keybind sequence, using shortened key replacements when possible.
     * ex. replacing `Escape` with `Esc`
     */
    stringifyShort(sequence: KeyCombo[]) {
        return sequence
            .map((combo) => KeyCombo.stringifyShort(combo).join("+"))
            .join(" ");
    },
};
