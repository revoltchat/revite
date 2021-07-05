export interface LastOpened {
    [key: string]: string;
}

export type LastOpenedAction =
    | { type: undefined }
    | {
          type: "LAST_OPENED_SET";
          parent: string;
          child: string;
      }
    | {
          type: "RESET";
      };

export function lastOpened(
    state = {} as LastOpened,
    action: LastOpenedAction,
): LastOpened {
    switch (action.type) {
        case "LAST_OPENED_SET": {
            return {
                ...state,
                [action.parent]: action.child,
            };
        }
        case "RESET":
            return {};
        default:
            return state;
    }
}
