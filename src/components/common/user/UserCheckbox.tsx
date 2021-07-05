import { User } from "revolt.js";

import Checkbox, { CheckboxProps } from "../../ui/Checkbox";

import UserIcon from "./UserIcon";

type UserProps = Omit<CheckboxProps, "children"> & { user: User };

export default function UserCheckbox({ user, ...props }: UserProps) {
    return (
        <Checkbox {...props}>
            <UserIcon target={user} size={32} />
            {user.username}
        </Checkbox>
    );
}
