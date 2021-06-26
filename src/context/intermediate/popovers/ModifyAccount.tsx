import { Text } from "preact-i18n";
import { useForm } from "react-hook-form";
import Modal from "../../../components/ui/Modal";
import { takeError } from "../../revoltjs/util";
import { useContext, useState } from "preact/hooks";
import FormField from '../../../pages/login/FormField';
import Overline from "../../../components/ui/Overline";
import { AppContext } from "../../revoltjs/RevoltClient";

interface Props {
    onClose: () => void;
    field: "username" | "email" | "password";
}

export function ModifyAccountModal({ onClose, field }: Props) {
    const client = useContext(AppContext);
    const { handleSubmit, register, errors } = useForm();
    const [error, setError] = useState<string | undefined>(undefined);

    async function onSubmit({
        password,
        new_username,
        new_email,
        new_password
    }: {
        password: string;
        new_username: string;
        new_email: string;
        new_password: string;
    }) {
        try {
            if (field === "email") {
                await client.req("POST", "/auth/change/email", {
                    password,
                    new_email
                });
                onClose();
            } else if (field === "password") {
                await client.req("POST", "/auth/change/password", {
                    password,
                    new_password
                });
                onClose();
            } else if (field === "username") {
                await client.req("PATCH", "/users/id/username", {
                    username: new_username,
                    password
                });
                onClose();
            }
        } catch (err) {
            setError(takeError(err));
        }
    }

    return (
        <Modal
            visible={true}
            onClose={onClose}
            title={<Text id={`app.special.modals.account.change.${field}`} />}
            actions={[
                {
                    confirmation: true,
                    onClick: handleSubmit(onSubmit),
                    text:
                        field === "email" ? (
                            <Text id="app.special.modals.actions.send_email" />
                        ) : (
                            <Text id="app.special.modals.actions.update" />
                        )
                },
                {
                    onClick: onClose,
                    text: <Text id="app.special.modals.actions.close" />
                }
            ]}
        >
            <form onSubmit={handleSubmit(onSubmit) as any}>
                {field === "email" && (
                    <FormField
                        type="email"
                        name="new_email"
                        register={register}
                        showOverline
                        error={errors.new_email?.message}
                    />
                )}
                {field === "password" && (
                    <FormField
                        type="password"
                        name="new_password"
                        register={register}
                        showOverline
                        error={errors.new_password?.message}
                    />
                )}
                {field === "username" && (
                    <FormField
                        type="username"
                        name="new_username"
                        register={register}
                        showOverline
                        error={errors.new_username?.message}
                    />
                )}
                <FormField
                    type="current_password"
                    register={register}
                    showOverline
                    error={errors.current_password?.message}
                />
                {error && (
                    <Overline type="error" error={error}>
                        <Text id="app.special.modals.account.failed" />
                    </Overline>
                )}
            </form>
        </Modal>
    );
}
