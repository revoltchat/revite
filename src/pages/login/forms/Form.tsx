import { CheckCircle, Envelope } from "@styled-icons/boxicons-regular";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import styles from "../Login.module.scss";
import { Text } from "preact-i18n";
import { useContext, useState } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { takeError } from "../../../context/revoltjs/util";

import wideSVG from "../../../assets/wide.svg";
import Button from "../../../components/ui/Button";
import Overline from "../../../components/ui/Overline";
import Preloader from "../../../components/ui/Preloader";

import FormField from "../FormField";
import { CaptchaBlock, CaptchaProps } from "./CaptchaBlock";
import { Legal } from "./Legal";
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

export function Form({ page, callback }: Props) {
	const client = useContext(AppContext);

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

		function onError(err: any) {
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
			if (
				client.configuration?.features.captcha.enabled &&
				page !== "reset"
			) {
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
				{client.configuration?.features.email ? (
					<>
						<Envelope size={72} />
						<h2>
							<Text id="login.check_mail" />
						</h2>
						<p className={styles.note}>
							<Text id="login.email_delay" />
						</p>
						<MailProvider email={success} />
					</>
				) : (
					<>
						<CheckCircle size={72} />
						<h1>
							<Text id="login.successful_registration" />
						</h1>
					</>
				)}
				<span className={styles.footer}>
					<Link to="/login">
						<a>
							<Text id="login.remembered" />
						</a>
					</Link>
				</span>
			</div>
		);
	}

	if (captcha) return <CaptchaBlock {...captcha} />;
	if (loading) return <Preloader type="spinner" />;

	return (
		<div className={styles.form}>
			<img src={wideSVG} />
			{/* Preact / React typing incompatabilities */}
			<form
				onSubmit={
					handleSubmit(
						onSubmit,
					) as JSX.GenericEventHandler<HTMLFormElement>
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
				{client.configuration?.features.invite_only &&
					page === "create" && (
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
						<Text id="login.existing" />
						<Link to="/login">
							<Text id="login.title" />
						</Link>
					</span>
					<span className={styles.create}>
						<Text id="login.missing_verification" />
						<Link to="/login/resend">
							<Text id="login.resend" />
						</Link>
					</span>
				</>
			)}
			{page === "login" && (
				<>
					<span className={styles.create}>
						<Text id="login.new" />
						<Link to="/login/create">
							<Text id="login.create" />
						</Link>
					</span>
					<span className={styles.create}>
						<Text id="login.forgot" />
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
			<Legal />
		</div>
	);
}
