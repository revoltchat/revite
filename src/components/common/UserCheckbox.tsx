import { User } from "revolt.js";
import UserIcon from "./UserIcon";
import Checkbox, { CheckboxProps } from "../ui/Checkbox";

type UserProps = Omit<CheckboxProps, "children"> & { user: User };

export default function UserCheckbox({ user, ...props }: UserProps) {
    return (
        <Checkbox {...props}>
            <UserIcon target={user} size={32} />
            {user.username}
        </Checkbox>
    );
}
