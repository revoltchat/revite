import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { useContext } from "preact/hooks";
import { Form } from "./Form";

export function FormCreate() {
    const { client } = useContext(AppContext);

    return (
        <Form
            page="create"
            callback={async data => {
                await client.register(import.meta.env.VITE_API_URL, data);
            }}
        />
    );
}
