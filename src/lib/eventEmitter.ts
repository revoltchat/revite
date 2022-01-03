import EventEmitter from "eventemitter3";

export const InternalEvent = new EventEmitter();

export function internalSubscribe(
  ns: string,
  event: string,
  fn: (...args: unknown[]) => void,
) {
  InternalEvent.addListener(`${ns}/${event}`, fn);
  return () => InternalEvent.removeListener(`${ns}/${event}`, fn);
}

export function internalEmit(ns: string, event: string, ...args: unknown[]) {
  InternalEvent.emit(`${ns}/${event}`, ...args);
}

// Event structure: namespace/event

/// Event List
// - RightSidebar/open
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
// - NewMessages/hide
// - LeftSidebar/navigate_channels(direction: number)
// - LeftSidebar/navigate_servers(direction: number)
