import { SubmitHandler, useForm } from "react-hook-form";

import { Text } from "preact-i18n";
import { useContext, useState } from "preact/hooks";

import Modal from "../../../components/ui/Modal";
import Overline from "../../../components/ui/Overline";

import FormField from "../../../pages/login/FormField";
import { AppContext } from "../../revoltjs/RevoltClient";
import { takeError } from "../../revoltjs/util";

interface Props {
    onClose: () => void;
    field: "username" | "email" | "password";
}

interface FormInputs {
    password: string;
    new_email: string;
    new_username: string;
    new_password: string;

    // TODO: figure out if this is correct or not
    // it wasn't in the types before this was typed but the element itself was there
    current_password?: string;
}

export function ModifyAccountModal({ onClose, field }: Props) {
    const client = useContext(AppContext);
    const [processing, setProcessing] = useState(false);
    const { handleSubmit, register, errors } = useForm<FormInputs>();
    const [error, setError] = useState<string | undefined>(undefined);

    const onSubmit: SubmitHandler<FormInputs> = async ({
        password,
        new_username,
        new_email,
        new_password,
    }) => {
        setProcessing(true);

        try {
            if (field === "email") {
                await client.req("PATCH", "/auth/account/change/email", {
                    current_password: password,
                    email: new_email,
                });
                onClose();
            } else if (field === "password") {
                await client.req("PATCH", "/auth/account/change/password", {
                    current_password: password,
                    password: new_password,
                });
                onClose();
            } else if (field === "username") {
                await client.req("PATCH", "/users/id/username", {
                    username: new_username,
                    password,
                });
                onClose();
            }
        } catch (err) {
            setError(takeError(err));
            setProcessing(false);
        }
    };

    return (
        <Modal
            visible={true}
            onClose={onClose}
            title={<Text id={`app.special.modals.account.change.${field}`} />}
            disabled={processing}
            actions={[
                {
                    confirmation: true,
                    onClick: handleSubmit(onSubmit),
                    children:
                        field === "email" ? (
                            <Text id="app.special.modals.actions.send_email" />
                        ) : (
                            <Text id="app.special.modals.actions.update" />
                        ),
                },
                {
                    onClick: onClose,
                    children: <Text id="app.special.modals.actions.close" />,
                },
            ]}>
            {/* Preact / React typing incompatabilities */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(
                        onSubmit,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    )(e as any);
                }}>
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
                        autoComplete="new-password"
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
                    autoComplete="current-password"
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
