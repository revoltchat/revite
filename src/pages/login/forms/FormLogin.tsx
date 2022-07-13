import { clientController } from "../../../controllers/client/ClientController";
import { Form } from "./Form";

export function FormLogin() {
    return <Form page="login" callback={clientController.login} />;
}
