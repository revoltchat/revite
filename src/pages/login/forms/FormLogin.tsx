import { Form } from "./Form";
import { detect } from "detect-browser";
import { useContext } from "preact/hooks";
import { useHistory } from "react-router-dom";
import { OperationsContext } from "../../../context/revoltjs/RevoltClient";

export function FormLogin() {
    const { login } = useContext(OperationsContext);
    const history = useHistory();

    return (
        <Form
            page="login"
            callback={async data => {
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
