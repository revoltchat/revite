import { detect } from "detect-browser";
import { useHistory } from "react-router-dom";

import { useContext } from "preact/hooks";

import { OperationsContext } from "../../../context/revoltjs/RevoltClient";

import { Form } from "./Form";

export function FormLogin() {
    const { login } = useContext(OperationsContext);
    const history = useHistory();

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

                await login({ ...data, friendly_name });
                history.push("/");
            }}
        />
    );
}
