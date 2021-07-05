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
                let device_name;
                if (browser) {
                    const { name, os } = browser;
                    device_name = `${name} on ${os}`;
                } else {
                    device_name = "Unknown Device";
                }

                await login({ ...data, device_name });
                history.push("/");
            }}
        />
    );
}
