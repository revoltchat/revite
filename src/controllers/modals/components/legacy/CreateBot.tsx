import { SubmitHandler, useForm } from "react-hook-form";
import { API } from "revolt.js";

import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { Category, Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../../lib/js";

import { I18nError } from "../../../../context/Locale";

import FormField from "../../../../pages/login/FormField";
import { useClient } from "../../../client/ClientController";
import { takeError } from "../../../client/jsx/error";
import { modalController } from "../../ModalController";
import { ModalProps } from "../../types";

interface FormInputs {
    name: string;
}

export function CreateBotModal({
    onCreate,
    ...props
}: ModalProps<"create_bot">) {
    const client = useClient();
    const { handleSubmit, register, errors } = useForm<FormInputs>();
    const [error, setError] = useState<string | undefined>(undefined);

    const onSubmit: SubmitHandler<FormInputs> = async ({ name }) => {
        try {
            const { bot } = await client.bots.create({ name });
            onCreate(bot);
            modalController.close();
        } catch (err) {
            setError(takeError(err));
        }
    };

    return (
        <Modal
            {...props}
            title={<Text id="app.special.popovers.create_bot.title" />}
            actions={[
                {
                    confirmation: true,
                    palette: "accent",
                    onClick: async () => {
                        await handleSubmit(onSubmit)();
                        return true;
                    },
                    children: <Text id="app.special.modals.actions.create" />,
                },
                {
                    palette: "plain",
                    onClick: noopTrue,
                    children: <Text id="app.special.modals.actions.cancel" />,
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
                <FormField
                    type="username"
                    name="name"
                    register={register}
                    showOverline
                    error={errors.name?.message}
                />
                {error && (
                    <Category>
                        <Text id="app.special.popovers.create_bot.failed" />{" "}
                        &middot; <I18nError error={error} />
                    </Category>
                )}
            </form>
        </Modal>
    );
}
