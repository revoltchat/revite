import { useHistory, useParams } from "react-router-dom";

import { useContext } from "preact/hooks";

import { useApplicationState } from "../../../mobx/State";

import { AppContext } from "../../../context/revoltjs/RevoltClient";

import { Form } from "./Form";

export function FormSendReset() {
    const config = useApplicationState().config;
    const client = config.createClient();

    return (
        <Form
            page="send_reset"
            callback={async (data) => {
                await client.req("POST", "/auth/account/reset_password", data);
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
                await client.req("PATCH", "/auth/account/reset_password", {
                    token,
                    ...data,
                });
                history.push("/login");
            }}
        />
    );
}
