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
	const { handleSubmit, register, errors } = useForm<FormInputs>();
	const [error, setError] = useState<string | undefined>(undefined);

	const onSubmit: SubmitHandler<FormInputs> = async ({
		password,
		new_username,
		new_email,
		new_password,
	}) => {
		try {
			if (field === "email") {
				await client.req("POST", "/auth/change/email", {
					password,
					new_email,
				});
				onClose();
			} else if (field === "password") {
				await client.req("POST", "/auth/change/password", {
					password,
					new_password,
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
		}
	};

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
						),
				},
				{
					onClick: onClose,
					text: <Text id="app.special.modals.actions.close" />,
				},
			]}>
			{/* Preact / React typing incompatabilities */}
			<form
				onSubmit={
					handleSubmit(
						onSubmit,
					) as JSX.GenericEventHandler<HTMLFormElement>
				}>
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
