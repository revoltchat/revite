import { detect } from "detect-browser";
import { API } from "revolt.js";

import { useApplicationState } from "../../../mobx/State";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import { modalController } from "../../../controllers/modals/ModalController";
import { Form } from "./Form";

export function FormLogin() {
    const state = useApplicationState();
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
                    let isiPad;
                    if (window.isNative) {
                        friendly_name = `Revolt Desktop on ${os}`;
                    } else {
                        if (name === "ios") {
                            name = "safari";
                        } else if (name === "fxios") {
                            name = "firefox";
                        } else if (name === "crios") {
                            name = "chrome";
                        }
                        if (os === "Mac OS" && navigator.maxTouchPoints > 0)
                            isiPad = true;
                        friendly_name = `${name} on ${isiPad ? "iPadOS" : os}`;
                    }
                } else {
                    friendly_name = "Unknown Device";
                }

                // ! FIXME: temporary login flow code
                // This should be replaced in the future.
                const client = state.config.createClient();
                await client.fetchConfiguration();

                let session = await client.api.post("/auth/session/login", {
                    ...data,
                    friendly_name,
                });

                if (session.result === "MFA") {
                    const { allowed_methods } = session;
                    const mfa_response: API.MFAResponse | undefined =
                        await new Promise((callback) =>
                            modalController.push({
                                type: "mfa_flow",
                                state: "unknown",
                                available_methods: allowed_methods,
                                callback,
                            }),
                        );

                    if (typeof mfa_response === "undefined") {
                        throw "Cancelled";
                    }

                    session = await client.api.post("/auth/session/login", {
                        mfa_response,
                        mfa_ticket: session.ticket,
                        friendly_name,
                    });

                    if (session.result === "MFA") {
                        // unreachable code
                        return;
                    }
                }

                const s = session;

                client.session = session;
                (client as any).$updateHeaders();

                async function login() {
                    state.auth.setSession(s);
                }

                const { onboarding } = await client.api.get("/onboard/hello");

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
