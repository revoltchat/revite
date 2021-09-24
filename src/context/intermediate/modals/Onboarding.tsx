import { SubmitHandler, useForm } from "react-hook-form";

import styles from "./Onboarding.module.scss";
import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import wideSVG from "../../../assets/wide.svg";
import Button from "../../../components/ui/Button";
import Preloader from "../../../components/ui/Preloader";

import FormField from "../../../pages/login/FormField";
import { takeError } from "../../revoltjs/util";

interface Props {
    onClose: () => void;
    callback: (username: string, loginAfterSuccess?: true) => Promise<void>;
}

interface FormInputs {
    username: string;
}

export function OnboardingModal({ onClose, callback }: Props) {
    const { handleSubmit, register } = useForm<FormInputs>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const onSubmit: SubmitHandler<FormInputs> = ({ username }) => {
        setLoading(true);
        callback(username, true)
            .then(() => onClose())
            .catch((err: unknown) => {
                setError(takeError(err));
                setLoading(false);
            });
    };

    return (
        <div className={styles.onboarding}>
            <div className={styles.header}>
                <h1>
                    <Text id="app.special.modals.onboarding.welcome" />
                    <img src={wideSVG} loading="eager" />
                </h1>
            </div>
            <div className={styles.form}>
                {loading ? (
                    <Preloader type="spinner" />
                ) : (
                    <>
                        <p>
                            <Text id="app.special.modals.onboarding.pick" />
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
                            <Button type="submit">
                                <Text id="app.special.modals.actions.continue" />
                            </Button>
                        </form>
                    </>
                )}
            </div>
            <div />
        </div>
    );
}
