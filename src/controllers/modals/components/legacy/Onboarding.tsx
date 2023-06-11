import { SubmitHandler, useForm } from "react-hook-form";

import styles from "./Onboarding.module.scss";
import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { Button, Preloader } from "@revoltchat/ui";

// import wideSVG from "/assets/wide.svg";
import background from "./assets/onboarding_background.svg";

import FormField from "../../../../pages/login/FormField";
import { takeError } from "../../../client/jsx/error";
import { ModalProps } from "../../types";

interface FormInputs {
    username: string;
}

export function OnboardingModal({
    callback,
    ...props
}: ModalProps<"onboarding">) {
    const { handleSubmit, register } = useForm<FormInputs>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const onSubmit: SubmitHandler<FormInputs> = ({ username }) => {
        setLoading(true);
        callback(username, true)
            .then(() => props.onClose())
            .catch((err: unknown) => {
                setError(takeError(err));
                setLoading(false);
            });
    };

    return (
        <div className={styles.onboarding}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>{"Welcome to Revolt."}</h1>
                </div>
                <div className={styles.form}>
                    {loading ? (
                        <Preloader type="spinner" />
                    ) : (
                        <>
                            <p>
                                {"It's time to choose a username."}
                                <br />
                                {
                                    "Others will be able to find, recognise and mention you with this name, so choose wisely."
                                }
                                <br />
                                {
                                    "You can change it at any time in your User Settings."
                                }
                            </p>
                            <form
                                onSubmit={
                                    handleSubmit(
                                        onSubmit,
                                    ) as unknown as JSX.GenericEventHandler<HTMLFormElement>
                                }>
                                <div>
                                    <FormField
                                        type="username"
                                        register={register}
                                        showOverline
                                        error={error}
                                    />
                                </div>
                                <p>
                                    You will be automatically assigned a number
                                    tag which you can find from settings.
                                </p>
                                <Button palette="accent">
                                    {"Looks good!"}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
            <img src={background} />
        </div>
    );
}
