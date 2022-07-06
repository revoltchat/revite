import { observer } from "mobx-react-lite";
import { Redirect } from "react-router-dom";

import { Preloader } from "@revoltchat/ui";

import { clientController } from "../ClientController";

interface Props {
    auth?: boolean;
    blockRender?: boolean;

    children: Children;
}

/**
 * Check that we are logged in or out and redirect accordingly.
 * Also prevent render until the client is ready to display.
 */
export const CheckAuth = observer((props: Props) => {
    const loggedIn = clientController.isLoggedIn();

    // Redirect if logged out on authenticated page or vice-versa.
    if (props.auth && !loggedIn) {
        if (props.blockRender) return null;
        return <Redirect to="/login" />;
    } else if (!props.auth && loggedIn) {
        if (props.blockRender) return null;
        return <Redirect to="/" />;
    }

    // Block render if client is getting ready to work.
    if (
        props.auth &&
        clientController.isLoggedIn() &&
        !clientController.isReady()
    ) {
        return <Preloader type="spinner" />;
    }

    return <>{props.children}</>;
});
