import type { RevoltConfiguration } from "revolt-api/types/Core";

export type ConfigAction =
    | { type: undefined }
    | {
          type: "SET_CONFIG";
          config: RevoltConfiguration;
      };

export function config(
    state = {} as RevoltConfiguration,
    action: ConfigAction,
): RevoltConfiguration {
    switch (action.type) {
        case "SET_CONFIG":
            return action.config;
        default:
            return state;
    }
}
