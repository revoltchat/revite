import type { Core } from "revolt.js/dist/api/objects";

export type ConfigAction =
    | { type: undefined }
    | {
        type: "SET_CONFIG";
        config: Core.RevoltNodeConfiguration;
      };

export function config(
    state = { } as Core.RevoltNodeConfiguration,
    action: ConfigAction
): Core.RevoltNodeConfiguration {
    switch (action.type) {
        case "SET_CONFIG":
            return action.config;
        default:
            return state;
    }
}
