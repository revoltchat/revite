import { useHistory, useParams } from "react-router-dom";

import { useEffect, useState } from "preact/hooks";

import { Category, Preloader } from "@revoltchat/ui";

import { I18nError } from "../../../context/Locale";

import { useApi } from "../../../controllers/client/ClientController";
import { takeError } from "../../../controllers/client/jsx/error";
import { Form } from "./Form";

export function FormResend() {
    const api = useApi();

    return (
        <Form
            page="resend"
            callback={async (data) => {
                await api.post("/auth/account/reverify", data);
            }}
        />
    );
}

export function FormVerify() {
    const [error, setError] = useState<undefined | string>(undefined);
    const { token } = useParams<{ token: string }>();
    const history = useHistory();
    const api = useApi();

    useEffect(() => {
        api.post(`/auth/account/verify/${token as ""}`)
            .then(() => history.push("/login"))
            .catch((err) => setError(takeError(err)));
        // eslint-disable-next-line
    }, []);

    return error ? (
        <Category>
            <I18nError error={error} />
        </Category>
    ) : (
        <Preloader type="ring" />
    );
}
