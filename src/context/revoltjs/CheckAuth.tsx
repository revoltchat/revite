import { Redirect } from "react-router-dom";

import { useApplicationState } from "../../mobx/State";

import { Children } from "../../types/Preact";
import { useClient } from "./RevoltClient";

interface Props {
    auth?: boolean;
    blockRender?: boolean;

    children: Children;
}

export const CheckAuth = (props: Props) => {
    const auth = useApplicationState().auth;
    const client = useClient();
    const ready = auth.isLoggedIn() && !!client?.user;

    if (props.auth && !ready) {
        if (props.blockRender) return null;
        return <Redirect to="/login" />;
    } else if (!props.auth && ready) {
        if (props.blockRender) return null;
        return <Redirect to="/" />;
    }

    return <>{props.children}</>;
};
