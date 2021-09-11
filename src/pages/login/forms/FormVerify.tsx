import { useHistory, useParams } from "react-router-dom";

import { useContext, useEffect, useState } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { takeError } from "../../../context/revoltjs/util";

import Overline from "../../../components/ui/Overline";
import Preloader from "../../../components/ui/Preloader";

import { Form } from "./Form";

export function FormResend() {
    const client = useContext(AppContext);

    return (
        <Form
            page="resend"
            callback={async (data) => {
                await client.req("POST", "/auth/account/reverify", data);
            }}
        />
    );
}

export function FormVerify() {
    const [error, setError] = useState<undefined | string>(undefined);
    const { token } = useParams<{ token: string }>();
    const client = useContext(AppContext);
    const history = useHistory();

    useEffect(() => {
        client
            .req(
                "POST",
                `/auth/account/verify/${token}` as "/auth/account/verify/:code",
            )
            .then(() => history.push("/login"))
            .catch((err) => setError(takeError(err)));
        // eslint-disable-next-line
    }, []);

    return error ? (
        <Overline type="error" error={error} />
    ) : (
        <Preloader type="ring" />
    );
}
