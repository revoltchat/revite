import EventEmitter from "eventemitter3";

export const InternalEvent = new EventEmitter();

export function internalSubscribe(
    ns: string,
    event: string,
    fn: (...args: any[]) => void,
) {
    InternalEvent.addListener(ns + "/" + event, fn);
    return () => InternalEvent.removeListener(ns + "/" + event, fn);
}

export function internalEmit(ns: string, event: string, ...args: any[]) {
    InternalEvent.emit(ns + "/" + event, ...args);
}

// Event structure: namespace/event

/// Event List
// - MessageArea/jump_to_bottom
// - MessageRenderer/edit_last
// - MessageRenderer/edit_message
// - Intermediate/open_profile
// - Intermediate/navigate
// - MessageBox/append
// - TextArea/focus
// - ReplyBar/add
// - Modal/close
// - PWA/update
