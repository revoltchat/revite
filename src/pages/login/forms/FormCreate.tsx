import { useClient } from "../../../controllers/client/ClientController";
import { Form } from "./Form";

export function FormCreate() {
    const client = useClient();
    return <Form page="create" callback={(data) => client.register(data)} />;
}
