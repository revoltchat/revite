import { SubmitHandler, useForm } from "react-hook-form";

import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { Category, Error, InputBox, Modal, Tip } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import FormField from "../../../pages/login/FormField";
import { useClient } from "../../client/ClientController";
import { takeError } from "../../client/jsx/error";
import { ModalProps } from "../types";

interface FormInputs {
    password: string;
    new_email: string;
    new_username: string;
    new_password: string;

    // TODO: figure out if this is correct or not
    // it wasn't in the types before this was typed but the element itself was there
    current_password?: string;
}

export default function ModifyAccount({
    field,
    ...props
}: ModalProps<"modify_account">) {
    const client = useClient();
    const [processing, setProcessing] = useState(false);
    const { handleSubmit, register, errors } = useForm<FormInputs>();
    const [error, setError] = useState<string | undefined>(undefined);

    const onSubmit: SubmitHandler<FormInputs> = async ({
        password,
        new_username,
        new_email,
        new_password,
    }) => {
        if (processing) return;
        setProcessing(true);

        try {
            if (field === "email") {
                await client.api.patch("/auth/account/change/email", {
                    current_password: password,
                    email: new_email,
                });
                props.onClose();
            } else if (field === "password") {
                await client.api.patch("/auth/account/change/password", {
                    current_password: password,
                    password: new_password,
                });
                props.onClose();
            } else if (field === "username") {
                await client.api.patch("/users/@me/username", {
                    username: new_username,
                    password,
                });
                props.onClose();
            }
        } catch (err) {
            setError(takeError(err));
            setProcessing(false);
        }
    };

    return (
        <Modal
            {...props}
            title={<Text id={`app.special.modals.account.change.${field}`} />}
            disabled={processing}
            actions={[
                {
                    confirmation: true,
                    onClick: () => void handleSubmit(onSubmit)(),
                    children:
                        field === "email" ? (
                            <Text id="app.special.modals.actions.send_email" />
                        ) : (
                            <Text id="app.special.modals.actions.update" />
                        ),
                },
                {
                    onClick: noopTrue,
                    children: <Text id="app.special.modals.actions.cancel" />,
                    palette: "plain",
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
                        disabled={processing}
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
                        disabled={processing}
                    />
                )}
                {field === "username" && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "end",
                            gap: "8px",
                        }}>
                        <div style={{ flexGrow: 1 }}>
                            <FormField
                                type="username"
                                name="new_username"
                                register={register}
                                showOverline
                                error={errors.new_username?.message}
                                disabled={processing}
                            />
                        </div>
                        <div
                            style={{
                                flexShrink: 0,
                                width: "80px",
                                textAlign: "center",
                            }}>
                            <InputBox
                                disabled
                                value={"#" + client.user.discriminator}
                            />
                        </div>
                    </div>
                )}
                <FormField
                    type="current_password"
                    register={register}
                    showOverline
                    error={errors.current_password?.message}
                    autoComplete="current-password"
                    disabled={processing}
                />
                {error && (
                    <Category compact>
                        <Error
                            error={
                                <>
                                    <Text id="app.special.modals.account.failed" />{" "}
                                    <Text id={`error.${error}`}>{error}</Text>
                                </>
                            }
                        />
                    </Category>
                )}

                {field === "username" && (
                    <div style={{ marginTop: "8px" }}>
                        <Tip palette="warning">
                            Changing your username may change your number tag.
                            You can freely change the case of your username.
                            Your number tag may change at most once a day.
                        </Tip>
                    </div>
                )}
            </form>
        </Modal>
    );
}
