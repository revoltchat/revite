export interface TrustedLinks {
    domains?: string[];
}

export type TrustedLinksAction =
    | { type: undefined }
    | {
          type: "TRUSTED_LINKS_ADD_DOMAIN";
          domain: string;
      }
    | {
          type: "TRUSTED_LINKS_REMOVE_DOMAIN";
          domain: string;
      };

export function trustedLinks(
    state = {} as TrustedLinks,
    action: TrustedLinksAction,
): TrustedLinks {
    switch (action.type) {
        case "TRUSTED_LINKS_ADD_DOMAIN":
            return {
                ...state,
                domains: [
                    ...(state.domains ?? []).filter((v) => v !== action.domain),
                    action.domain,
                ],
            };
        case "TRUSTED_LINKS_REMOVE_DOMAIN":
            return {
                ...state,
                domains: state.domains?.filter((v) => v !== action.domain),
            };
        default:
            return state;
    }
}
