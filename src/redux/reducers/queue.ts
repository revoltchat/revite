import { MessageObject } from "../../context/revoltjs/util";

export enum QueueStatus {
    SENDING = "sending",
    ERRORED = "errored",
}

export interface QueuedMessage {
    id: string;
    channel: string;
    data: MessageObject;
    status: QueueStatus;
    error?: string;
}

export type QueueAction =
    | { type: undefined }
    | {
          type: "QUEUE_ADD";
          nonce: string;
          channel: string;
          message: MessageObject;
      }
    | {
          type: "QUEUE_FAIL";
          nonce: string;
          error: string;
      }
    | {
          type: "QUEUE_START";
          nonce: string;
      }
    | {
          type: "QUEUE_REMOVE";
          nonce: string;
      }
    | {
          type: "QUEUE_DROP_ALL";
      }
    | {
          type: "QUEUE_FAIL_ALL";
      }
    | {
          type: "RESET";
      };

export function queue(
    state: QueuedMessage[] = [],
    action: QueueAction
): QueuedMessage[] {
    switch (action.type) {
        case "QUEUE_ADD": {
            return [
                ...state.filter((x) => x.id !== action.nonce),
                {
                    id: action.nonce,
                    data: action.message,
                    channel: action.channel,
                    status: QueueStatus.SENDING,
                },
            ];
        }
        case "QUEUE_FAIL": {
            const entry = state.find(
                (x) => x.id === action.nonce
            ) as QueuedMessage;
            return [
                ...state.filter((x) => x.id !== action.nonce),
                {
                    ...entry,
                    status: QueueStatus.ERRORED,
                    error: action.error,
                },
            ];
        }
        case "QUEUE_START": {
            const entry = state.find(
                (x) => x.id === action.nonce
            ) as QueuedMessage;
            return [
                ...state.filter((x) => x.id !== action.nonce),
                {
                    ...entry,
                    status: QueueStatus.SENDING,
                },
            ];
        }
        case "QUEUE_REMOVE":
            return state.filter((x) => x.id !== action.nonce);
        case "QUEUE_FAIL_ALL":
            return state.map((x) => {
                return {
                    ...x,
                    status: QueueStatus.ERRORED,
                };
            });
        case "QUEUE_DROP_ALL":
        case "RESET":
            return [];
        default:
            return state;
    }
}
