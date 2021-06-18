import { RevoltClient } from "../../../context/revoltjs/RevoltClient";
import { Form } from "./Form";

export function FormCreate() {
    return (
        <Form
            page="create"
            callback={async data => {
                await RevoltClient.register(process.env.API_SERVER as string, data);
            }}
        />
    );
}
