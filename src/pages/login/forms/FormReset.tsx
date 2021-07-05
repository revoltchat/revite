import { useHistory, useParams } from "react-router-dom";

import { useContext } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";

import { Form } from "./Form";

export function FormSendReset() {
    const client = useContext(AppContext);

    return (
        <Form
            page="send_reset"
            callback={async (data) => {
                await client.req("POST", "/auth/send_reset", data);
            }}
        />
    );
}

export function FormReset() {
    const { token } = useParams<{ token: string }>();
    const client = useContext(AppContext);
    const history = useHistory();

    return (
        <Form
            page="reset"
            callback={async (data) => {
                await client.req("POST", "/auth/reset", {
                    token,
                    ...data,
                });
                history.push("/login");
            }}
        />
    );
}
