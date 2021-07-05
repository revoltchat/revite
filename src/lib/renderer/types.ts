import { Message } from "revolt.js";

import { MessageObject } from "../../context/revoltjs/util";

import { SingletonRenderer } from "./Singleton";

export type ScrollState =
    | { type: "Free" }
    | { type: "Bottom"; scrollingUntil?: number }
    | { type: "ScrollToBottom" | "StayAtBottom"; smooth?: boolean }
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
          messages: MessageObject[];
      };

export interface RendererRoutines {
    init: (
        renderer: SingletonRenderer,
        id: string,
        smooth?: boolean,
    ) => Promise<void>;

    receive: (renderer: SingletonRenderer, message: Message) => Promise<void>;
    edit: (
        renderer: SingletonRenderer,
        id: string,
        partial: Partial<Message>,
    ) => Promise<void>;
    delete: (renderer: SingletonRenderer, id: string) => Promise<void>;

    loadTop: (
        renderer: SingletonRenderer,
        generateScroll: (end: string) => ScrollState,
    ) => Promise<void>;
    loadBottom: (
        renderer: SingletonRenderer,
        generateScroll: (start: string) => ScrollState,
    ) => Promise<void>;
}
