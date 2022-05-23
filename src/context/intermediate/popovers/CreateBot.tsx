import { SubmitHandler, useForm } from "react-hook-form";
import { API } from "revolt.js";

import { Text } from "preact-i18n";
import { useContext, useState } from "preact/hooks";

import Modal from "../../../components/ui/Modal";
import Overline from "../../../components/ui/Overline";

import FormField from "../../../pages/login/FormField";
import { AppContext } from "../../revoltjs/RevoltClient";
import { takeError } from "../../revoltjs/util";

interface Props {
    onClose: () => void;
    onCreate: (bot: API.Bot) => void;
}

interface FormInputs {
    name: string;
}

export function CreateBotModal({ onClose, onCreate }: Props) {
    const client = useContext(AppContext);
    const { handleSubmit, register, errors } = useForm<FormInputs>();
    const [error, setError] = useState<string | undefined>(undefined);

    const onSubmit: SubmitHandler<FormInputs> = async ({ name }) => {
        try {
            const { bot } = await client.bots.create({ name });
            onCreate(bot);
            onClose();
        } catch (err) {
            setError(takeError(err));
        }
    };

    return (
        <Modal
            visible={true}
            onClose={onClose}
            title={<Text id="app.special.popovers.create_bot.title" />}
            actions={[
                {
                    confirmation: true,
                    palette: "accent",
                    onClick: handleSubmit(onSubmit),
                    children: <Text id="app.special.modals.actions.create" />,
                },
                {
                    palette: "plain",
                    onClick: onClose,
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
                    <Overline type="error" error={error}>
                        <Text id="app.special.popovers.create_bot.failed" />
                    </Overline>
                )}
            </form>
        </Modal>
    );
}
