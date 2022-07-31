import { Message } from "revolt.js";

import { ChannelRenderer } from "./Singleton";

export type ScrollState =
    | { type: "Free" }
    | { type: "Bottom"; scrollingUntil?: number }
    | { type: "ScrollToBottom" | "StayAtBottom"; smooth?: boolean }
    | { type: "ScrollToView"; id: string }
    | { type: "OffsetTop"; previousHeight: number }
    | { type: "ScrollTop"; y: number };

export type RenderState =
    | {
          type: "LOADING" | "WAITING_FOR_NETWORK" | "EMPTY";
      }
    | {
          type: "RENDER";
          atTop: boolean;
          atBottom: boolean;
          messages: Message[];
      };

export interface RendererRoutines {
    init: (
        renderer: ChannelRenderer,
        message?: string,
        smooth?: boolean,
    ) => Promise<void>;

    receive: (renderer: ChannelRenderer, message: Message) => Promise<void>;
    updated: (
        renderer: ChannelRenderer,
        id: string,
        message: Message,
    ) => Promise<void>;
    delete: (renderer: ChannelRenderer, id: string) => Promise<void>;

    loadTop: (
        renderer: ChannelRenderer,
        generateScroll: (end: string) => ScrollState,
    ) => Promise<void | true>;
    loadBottom: (
        renderer: ChannelRenderer,
        generateScroll: (start: string) => ScrollState,
    ) => Promise<void | true>;
}
