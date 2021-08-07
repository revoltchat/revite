import type { ChannelUnread } from "revolt-api/types/Sync";
import { ulid } from "ulid";

export interface Unreads {
    [key: string]: Partial<Omit<ChannelUnread, "_id">>;
}

export type UnreadsAction =
    | { type: undefined }
    | {
          type: "UNREADS_MARK_READ";
          channel: string;
          message: string;
      }
    | {
          type: "UNREADS_MARK_MULTIPLE_READ";
          channels: string[];
      }
    | {
          type: "UNREADS_SET";
          unreads: ChannelUnread[];
      }
    | {
          type: "UNREADS_MENTION";
          channel: string;
          message: string;
      }
    | {
          type: "RESET";
      };

export function unreads(state = {} as Unreads, action: UnreadsAction): Unreads {
    switch (action.type) {
        case "UNREADS_MARK_READ":
            return {
                ...state,
                [action.channel]: {
                    last_id: action.message,
                },
            };
        case "UNREADS_MARK_MULTIPLE_READ": {
            const newState = { ...state };
            const last_id = ulid();
            for (const channel of action.channels) {
                newState[channel] = {
                    last_id,
                };
            }

            return newState;
        }
        case "UNREADS_SET": {
            const obj: Unreads = {};
            for (const entry of action.unreads) {
                const { _id, ...v } = entry;
                obj[_id.channel] = v;
            }

            return obj;
        }
        case "UNREADS_MENTION": {
            const obj = state[action.channel];

            return {
                ...state,
                [action.channel]: {
                    ...obj,
                    mentions: [...(obj?.mentions ?? []), action.message],
                },
            };
        }
        case "RESET":
            return {};
        default:
            return state;
    }
}
