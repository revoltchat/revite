export type Experiments = "search";
export const AVAILABLE_EXPERIMENTS: Experiments[] = ["search"];
export const EXPERIMENTS: {
    [key in Experiments]: { title: string; description: string };
} = {
    search: {
        title: "Search",
        description: "Allows you to search for messages in channels.",
    },
};

export interface ExperimentOptions {
    enabled?: Experiments[];
}

export type ExperimentsAction =
    | { type: undefined }
    | {
          type: "EXPERIMENTS_ENABLE";
          key: Experiments;
      }
    | {
          type: "EXPERIMENTS_DISABLE";
          key: Experiments;
      };

export function experiments(
    state = {} as ExperimentOptions,
    action: ExperimentsAction,
): ExperimentOptions {
    switch (action.type) {
        case "EXPERIMENTS_ENABLE":
            return {
                ...state,
                enabled: [
                    ...(state.enabled ?? [])
                        .filter((x) => AVAILABLE_EXPERIMENTS.includes(x))
                        .filter((v) => v !== action.key),
                    action.key,
                ],
            };
        case "EXPERIMENTS_DISABLE":
            return {
                ...state,
                enabled: state.enabled
                    ?.filter((v) => v !== action.key)
                    .filter((x) => AVAILABLE_EXPERIMENTS.includes(x)),
            };
        default:
            return state;
    }
}
