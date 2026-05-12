import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "preact/hooks";
import { Button, Preloader } from "@revoltchat/ui";
import styles from "../Login.module.scss";
import FormField from "../FormField";

const API = import.meta.env.VITE_API_URL as string;

interface FormInputs {
    email: string;
    password: string;
    username: string;
    entry_code: string;
}

function getParam(key: string) {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get(key) ?? "";
}

export function FormCreate() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [done, setDone] = useState(false);

    const prefilledCode = getParam("code");
    if (prefilledCode) sessionStorage.setItem("invite_code", prefilledCode);

    const { handleSubmit, register, setValue } = useForm<FormInputs>({
        defaultValues: {
            email: getParam("email"),
            password: "",
            username: "",
            entry_code: prefilledCode,
        },
    });

    useEffect(() => {
        if (!prefilledCode) return;
        fetch(`${API}/admin/invitations/${prefilledCode}/check`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data?.email) setValue("email", data.email); })
            .catch(() => undefined);
    }, [prefilledCode]);

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setLoading(true);
        setError(undefined);
        try {
            const username = data.email
                .split("@")[0]
                .replace(/[^\p{L}\d_.\-]/gu, "")
                .slice(0, 32) || "user";

            // 1. Create account (may already exist — OperationFailed is authifier's
            //    intentionally vague response for duplicate email, so we fall through to login)
            await fetch(`${API}/auth/account/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });

            // 2. Login
            let r = await fetch(`${API}/auth/session/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });
            if (!r.ok) {
                const j = await r.json().catch(() => ({}));
                throw new Error(j.type ?? "Login failed");
            }
            const { token } = await r.json();

            // 3. Complete onboarding — creates #username room + bot greeting
            r = await fetch(`${API}/onboard/complete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-session-token": token,
                },
                body: JSON.stringify({
                    username,
                    entry_code: prefilledCode || data.entry_code,
                }),
            });
            if (!r.ok) {
                const j = await r.json().catch(() => ({}));
                throw new Error(j.type ?? "Onboarding failed");
            }

            setDone(true);
            // Small delay then redirect to login so the client picks up the new session
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className={styles.success}>
                <div className={styles.title}>{"Account created! Signing you in…"}</div>
            </div>
        );
    }

    if (loading) return <Preloader type="spinner" />;

    return (
        <div className={styles.formModal}>
            <div className={styles.welcome}>
                <div className={styles.title}>{"Welcome to Apricotter"}</div>
                <div className={styles.subtitle}>{"Create your account"}</div>
            </div>
            <form
                onSubmit={
                    handleSubmit(onSubmit) as unknown as JSX.GenericEventHandler<HTMLFormElement>
                }>
                <FormField type="email" register={register} showOverline />
                <FormField type="password" register={register} showOverline />
                {!prefilledCode && <FormField type="invite" register={register} showOverline />}
                {error && (
                    <p style={{ fontSize: "0.8em", color: "var(--error)" }}>{error}</p>
                )}
                <Button palette="accent">{"Create Account"}</Button>
            </form>
        </div>
    );
}
