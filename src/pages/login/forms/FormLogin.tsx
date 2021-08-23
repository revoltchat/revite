import { Form } from "./Form";
import { detect } from "detect-browser";
import { useContext } from "preact/hooks";
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
                    let { name } = browser;
                    const { os } = browser;
                    if (window.isNative) {
                        device_name = `Revolt Desktop on ${os}`;
                    } else {
                      if(name === "ios") {
                          name = "safari";
                      }else if(name === "fxios") {
                          name = "firefox";
                      }
                      device_name = `${name} on ${os}`;
                    }
                } else {
                    device_name = "Unknown Device";
                }

                await login({ ...data, device_name });
                history.push("/");
            }}
        />
    );
}
