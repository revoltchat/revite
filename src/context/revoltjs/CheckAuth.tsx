import { ReactNode } from "react";
import { useContext } from "preact/hooks";
import { Redirect } from "react-router-dom";

import { AppContext } from "./RevoltClient";

interface Props {
    auth?: boolean;
    children: ReactNode | ReactNode[];
}

export const CheckAuth = (props: Props) => {
    const { operations } = useContext(AppContext);

    if (props.auth && !operations.ready()) {
        return <Redirect to="/login" />;
    } else if (!props.auth && operations.ready()) {
        return <Redirect to="/" />;
    }

    return <>{props.children}</>;
};
