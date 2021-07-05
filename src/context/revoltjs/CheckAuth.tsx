import { Redirect } from "react-router-dom";

import { useContext } from "preact/hooks";

import { Children } from "../../types/Preact";
import { OperationsContext } from "./RevoltClient";

interface Props {
	auth?: boolean;
	children: Children;
}

export const CheckAuth = (props: Props) => {
	const operations = useContext(OperationsContext);

	if (props.auth && !operations.ready()) {
		return <Redirect to="/login" />;
	} else if (!props.auth && operations.ready()) {
		return <Redirect to="/" />;
	}

	return <>{props.children}</>;
};
