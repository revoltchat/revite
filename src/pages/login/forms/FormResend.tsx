import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { useContext } from "preact/hooks";
import { Form } from "./Form";

export function FormResend() {
    const client = useContext(AppContext);

    return (
        <Form
            page="resend"
            callback={async data => {
                await client.req("POST", "/auth/resend", data);
            }}
        />
    );
}
