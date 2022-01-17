import { CheckCircle, Envelope } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import styles from "../Login.module.scss";
import { Text } from "preact-i18n";
import { useContext, useState } from "preact/hooks";

import { useApplicationState } from "../../../mobx/State";

import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { takeError } from "../../../context/revoltjs/util";

import Button from "../../../components/ui/Button";
import Overline from "../../../components/ui/Overline";
import Preloader from "../../../components/ui/Preloader";
import WaveSVG from "../../settings/assets/wave.svg";

import FormField from "../FormField";
import { CaptchaBlock, CaptchaProps } from "./CaptchaBlock";
import { MailProvider } from "./MailProvider";

interface Props {
    page: "create" | "login" | "send_reset" | "reset" | "resend";
    callback: (fields: {
        email: string;
        password: string;
        invite: string;
        captcha?: string;
    }) => Promise<void>;
}

function getInviteCode() {
    if (typeof window === "undefined") return "";

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    return code ?? "";
}

interface FormInputs {
    email: string;
    password: string;
    invite: string;
}

export const Form = observer(({ page, callback }: Props) => {
    const configuration = useApplicationState().config.get();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | undefined>(undefined);
    const [error, setGlobalError] = useState<string | undefined>(undefined);
    const [captcha, setCaptcha] = useState<CaptchaProps | undefined>(undefined);

    const { handleSubmit, register, errors, setError } = useForm<FormInputs>({
        defaultValues: {
            email: "",
            password: "",
            invite: getInviteCode(),
        },
    });

    async function onSubmit(data: FormInputs) {
        setGlobalError(undefined);
        setLoading(true);

        function onError(err: unknown) {
            setLoading(false);

            const error = takeError(err);
            switch (error) {
                case "email_in_use":
                    return setError("email", { type: "", message: error });
                case "unknown_user":
                    return setError("email", { type: "", message: error });
                case "invalid_invite":
                    return setError("invite", { type: "", message: error });
            }

            setGlobalError(error);
        }

        try {
            if (configuration?.features.captcha.enabled && page !== "reset") {
                setCaptcha({
                    onSuccess: async (captcha) => {
                        setCaptcha(undefined);
                        try {
                            await callback({ ...data, captcha });
                            setSuccess(data.email);
                        } catch (err) {
                            onError(err);
                        }
                    },
                    onCancel: () => {
                        setCaptcha(undefined);
                        setLoading(false);
                    },
                });
            } else {
                await callback(data);
                setSuccess(data.email);
            }
        } catch (err) {
            onError(err);
        }
    }

    if (typeof success !== "undefined") {
        return (
            <div className={styles.success}>
                {configuration?.features.email ? (
                    <>
                        <div>
                            <div className={styles.title}>
                                <Text id="login.check_mail" />
                            </div>
                            <div className={styles.subtitle}>
                                <Text id="login.email_delay" />
                            </div>
                        </div>
                        <MailProvider email={success} />
                    </>
                ) : (
                    <>
                        <div className={styles.title}>
                            <Text id="login.successful_registration" />
                        </div>
                    </>
                )}
                <Link to="/login">
                    <a>
                        <Text id="login.remembered" />
                    </a>
                </Link>
            </div>
        );
    }

    if (captcha) return <CaptchaBlock {...captcha} />;
    if (loading) return <Preloader type="spinner" />;

    return (
        <div className={styles.formModal}>
            <div className={styles.welcome}>
                <div className={styles.title}>
                    <img src={WaveSVG} draggable={false} />
                    <Text id="login.welcome" />
                </div>
                <div className={styles.subtitle}>
                    <Text id="login.subtitle" />
                    <div>(app.revolt.chat)</div>
                </div>
            </div>

            {/* Preact / React typing incompatabilities */}
            <form
                onSubmit={
                    handleSubmit(
                        onSubmit,
                    ) as unknown as JSX.GenericEventHandler<HTMLFormElement>
                }>
                {page !== "reset" && (
                    <FormField
                        type="email"
                        register={register}
                        showOverline
                        error={errors.email?.message}
                    />
                )}
                {(page === "login" ||
                    page === "create" ||
                    page === "reset") && (
                    <FormField
                        type="password"
                        register={register}
                        showOverline
                        error={errors.password?.message}
                    />
                )}
                {configuration?.features.invite_only && page === "create" && (
                    <FormField
                        type="invite"
                        register={register}
                        showOverline
                        error={errors.invite?.message}
                    />
                )}
                {error && (
                    <Overline type="error" error={error}>
                        <Text id={`login.error.${page}`} />
                    </Overline>
                )}
                <Button>
                    <Text
                        id={
                            page === "create"
                                ? "login.register"
                                : page === "login"
                                ? "login.title"
                                : page === "reset"
                                ? "login.set_password"
                                : page === "resend"
                                ? "login.resend"
                                : "login.reset"
                        }
                    />
                </Button>
            </form>
            {page === "create" && (
                <>
                    <span className={styles.create}>
                        <Text id="login.existing" />{" "}
                        <Link to="/login">
                            <Text id="login.title" />
                        </Link>
                    </span>
                    <span className={styles.create}>
                        <Text id="login.missing_verification" />{" "}
                        <Link to="/login/resend">
                            <Text id="login.resend" />
                        </Link>
                    </span>
                </>
            )}
            {page === "login" && (
                <>
                    <span className={styles.create}>
                        <Text id="login.new" />{" "}
                        <Link to="/login/create">
                            <Text id="login.create" />
                        </Link>
                    </span>
                    <span className={styles.create}>
                        <Text id="login.forgot" />{" "}
                        <Link to="/login/reset">
                            <Text id="login.reset" />
                        </Link>
                    </span>
                </>
            )}
            {(page === "reset" ||
                page === "resend" ||
                page === "send_reset") && (
                <>
                    <span className={styles.create}>
                        <Link to="/login">
                            <Text id="login.remembered" />
                        </Link>
                    </span>
                </>
            )}
        </div>
    );
});
