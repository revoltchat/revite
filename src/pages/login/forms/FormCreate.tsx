import { useApplicationState } from "../../../mobx/State";

import { Form } from "./Form";

export function FormCreate() {
    const config = useApplicationState().config;
    const client = config.createClient();
    return <Form page="create" callback={(data) => client.register(data)} />;
}
