import { useHistory, useParams } from "react-router-dom";

import { useApi } from "../../../controllers/client/ClientController";
import { Form } from "./Form";

export function FormSendReset() {
    const api = useApi();

    return (
        <Form
            page="send_reset"
            callback={async (data) => {
                await api.post("/auth/account/reset_password", data);
            }}
        />
    );
}

export function FormReset() {
    const { token } = useParams<{ token: string }>();
    const history = useHistory();
    const api = useApi();

    return (
        <Form
            page="reset"
            callback={async (data) => {
                await api.patch("/auth/account/reset_password", {
                    token,
                    ...data,
                });
                history.push("/login");
            }}
        />
    );
}
