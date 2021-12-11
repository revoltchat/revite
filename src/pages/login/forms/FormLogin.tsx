import { detect } from "detect-browser";
import { Session } from "revolt-api/types/Auth";
import { Client } from "revolt.js";

import { useApplicationState } from "../../../mobx/State";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import { Form } from "./Form";

export function FormLogin() {
    const auth = useApplicationState().auth;
    const { openScreen } = useIntermediate();

    return (
        <Form
            page="login"
            callback={async (data) => {
                const browser = detect();
                let friendly_name;
                if (browser) {
                    let { name } = browser;
                    const { os } = browser;
                    if (window.isNative) {
                        friendly_name = `Revolt Desktop on ${os}`;
                    } else {
                        if (name === "ios") {
                            name = "safari";
                        } else if (name === "fxios") {
                            name = "firefox";
                        }
                        friendly_name = `${name} on ${os}`;
                    }
                } else {
                    friendly_name = "Unknown Device";
                }

                // ! FIXME: temporary login flow code
                // This should be replaced in the future.
                const client = new Client();
                await client.fetchConfiguration();
                const session = (await client.req(
                    "POST",
                    "/auth/session/login",
                    { ...data, friendly_name },
                )) as unknown as Session;

                client.session = session;
                (client as any).Axios.defaults.headers = {
                    "x-session-token": session?.token,
                };

                function login() {
                    auth.setSession(session);
                }

                const { onboarding } = await client.req(
                    "GET",
                    "/onboard/hello",
                );
                if (onboarding) {
                    openScreen({
                        id: "onboarding",
                        callback: async (username: string) =>
                            client
                                .completeOnboarding({ username }, false)
                                .then(login),
                    });
                } else {
                    login();
                }
            }}
        />
    );
}
