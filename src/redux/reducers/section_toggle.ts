export interface SectionToggle {
    [key: string]: boolean;
}

export type SectionToggleAction =
    | { type: undefined }
    | {
          type: "SECTION_TOGGLE_SET";
          id: string;
          state: boolean;
      }
    | {
          type: "SECTION_TOGGLE_UNSET";
          id: string;
      }
    | {
          type: "RESET";
      };

export function sectionToggle(
    state = {} as SectionToggle,
    action: SectionToggleAction,
): SectionToggle {
    switch (action.type) {
        case "SECTION_TOGGLE_SET": {
            return {
                ...state,
                [action.id]: action.state,
            };
        }
        case "SECTION_TOGGLE_UNSET": {
            const { [action.id]: _, ...newState } = state;
            return newState;
        }
        case "RESET":
            return {};
        default:
            return state;
    }
}
