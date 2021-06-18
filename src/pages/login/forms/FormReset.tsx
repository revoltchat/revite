import { Form } from "./Form";
import { useHistory, useParams } from "react-router-dom";
import { RevoltClient } from "../../../context/revoltjs/RevoltClient";

export function FormSendReset() {
    return (
        <Form
            page="send_reset"
            callback={async data => {
                await RevoltClient.req("POST", "/auth/send_reset", data);
            }}
        />
    );
}

export function FormReset() {
    const { token } = useParams<{ token: string }>();
    const history = useHistory();

    return (
        <Form
            page="reset"
            callback={async data => {
                await RevoltClient.req("POST", "/auth/reset" as any, {
                    token,
                    ...(data as any)
                });
                history.push("/login");
            }}
        />
    );
}
