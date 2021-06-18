import { RevoltClient } from "../../../context/revoltjs/RevoltClient";
import { Form } from "./Form";

export function FormResend() {
    return (
        <Form
            page="resend"
            callback={async data => {
                await RevoltClient.req("POST", "/auth/resend", data);
            }}
        />
    );
}
