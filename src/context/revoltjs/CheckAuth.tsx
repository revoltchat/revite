import { Redirect } from "react-router-dom";

import { useSession } from "../../controllers/client/ClientController";

interface Props {
    auth?: boolean;
    blockRender?: boolean;

    children: Children;
}

export const CheckAuth = (props: Props) => {
    const session = useSession();

    if (props.auth && !session?.ready) {
        if (props.blockRender) return null;
        return <Redirect to="/login" />;
    } else if (!props.auth && session?.ready) {
        if (props.blockRender) return null;
        return <Redirect to="/" />;
    }

    return <>{props.children}</>;
};
