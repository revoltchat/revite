export type TypingUser = { id: string; started: number };
export type Typing = { [key: string]: TypingUser[] };

export type TypingAction =
    | { type: undefined }
    | {
          type: "TYPING_START";
          channel: string;
          user: string;
      }
    | {
          type: "TYPING_STOP";
          channel: string;
          user: string;
      }
    | {
          type: "RESET";
      };

export function typing(state: Typing = {}, action: TypingAction): Typing {
    switch (action.type) {
        case "TYPING_START":
            return {
                ...state,
                [action.channel]: [
                    ...(state[action.channel] ?? []).filter(
                        (x) => x.id !== action.user
                    ),
                    {
                        id: action.user,
                        started: +new Date(),
                    },
                ],
            };
        case "TYPING_STOP":
            return {
                ...state,
                [action.channel]:
                    state[action.channel]?.filter(
                        (x) => x.id !== action.user
                    ) ?? [],
            };
        case "RESET":
            return {};
        default:
            return state;
    }
}
