import type { Auth } from "revolt.js/dist/api/objects";

export interface AuthState {
    accounts: {
        [key: string]: {
            session: Auth.Session;
        };
    };
    active?: string;
}

export type AuthAction =
    | { type: undefined }
    | {
          type: "LOGIN";
          session: Auth.Session;
      }
    | {
          type: "LOGOUT";
          user_id?: string;
      };

export function auth(
    state = { accounts: {} } as AuthState,
    action: AuthAction
): AuthState {
    switch (action.type) {
        case "LOGIN":
            return {
                accounts: {
                    ...state.accounts,
                    [action.session.user_id]: {
                        session: action.session,
                    },
                },
                active: action.session.user_id,
            };
        case "LOGOUT": {
            const accounts = Object.assign({}, state.accounts);
            action.user_id && delete accounts[action.user_id];

            return {
                accounts,
            };
        }
        default:
            return state;
    }
}
