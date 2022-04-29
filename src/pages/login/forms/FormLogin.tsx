import { detect } from "detect-browser";
import { API } from "revolt.js";

import { useApplicationState } from "../../../mobx/State";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

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
                const session = await client.api.post("/auth/session/login", {
                    ...data,
                    friendly_name,
                });

                if (session.result !== "Success") {
                    alert("unsupported!");
                    return;
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
