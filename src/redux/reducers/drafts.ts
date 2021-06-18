export type Drafts = { [key: string]: string };

export type DraftAction =
    | { type: undefined }
    | {
          type: "SET_DRAFT";
          channel: string;
          content: string;
      }
    | {
          type: "CLEAR_DRAFT";
          channel: string;
      }
    | {
          type: "RESET";
      };

export function drafts(state: Drafts = {}, action: DraftAction): Drafts {
    switch (action.type) {
        case "SET_DRAFT":
            return {
                ...state,
                [action.channel]: action.content
            };
        case "CLEAR_DRAFT":
            const { [action.channel]: _, ...newState } = state;
            return newState;
        case "RESET":
            return {};
        default:
            return state;
    }
}
