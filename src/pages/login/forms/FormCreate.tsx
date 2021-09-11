import { useContext } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";

import { Form } from "./Form";

export function FormCreate() {
    const client = useContext(AppContext);
    return <Form page="create" callback={(data) => client.register(data)} />;
}
