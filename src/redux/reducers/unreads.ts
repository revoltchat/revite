import { Sync } from "revolt.js/dist/api/objects";

export interface Unreads {
    [key: string]: Partial<Omit<Sync.ChannelUnread, '_id'>>;
}

export type UnreadsAction =
    | { type: undefined }
    | {
        type: "UNREADS_MARK_READ";
        channel: string;
        message: string;
        request: boolean;
      }
    | {
        type: "UNREADS_SET";
        unreads: Sync.ChannelUnread[];
    }
    | {
        type: "UNREADS_MENTION";
        channel: string;
        message: string;
    }
    | {
        type: "RESET";
      };

export function unreads(state = {}, action: UnreadsAction): Unreads {
    switch (action.type) {
        case "UNREADS_MARK_READ":
            if (action.request) {
                // client.req('PUT', `/channels/${action.channel}/ack/${action.message}` as '/channels/id/ack/id');
            }

            return {
                ...state,
                [action.channel]: {
                    last_id: action.message
                }
            };
        case "UNREADS_SET":
            {
                const obj: Unreads = {};
                for (const entry of action.unreads) {
                    const { _id, ...v } = entry;
                    obj[_id.channel] = v;
                }

                return obj;
            }
        case "UNREADS_MENTION":
            {
                const obj = (state as any)[action.channel];

                return {
                    ...state,
                    [action.channel]: {
                        ...obj,
                        mentions: [ ...(obj?.mentions ?? []), action.message ]
                    }
                }
            }
        case "RESET":
            return {};
        default:
            return state;
    }
}
