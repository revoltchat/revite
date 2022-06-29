import { observer } from "mobx-react-lite";
import { Redirect } from "react-router-dom";

import { clientController } from "../../controllers/client/ClientController";

interface Props {
    auth?: boolean;
    blockRender?: boolean;

    children: Children;
}

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

    return <>{props.children}</>;
});
