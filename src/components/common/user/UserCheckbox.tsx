import { User } from "../../../mobx";

import Checkbox, { CheckboxProps } from "../../ui/Checkbox";

import UserIcon from "./UserIcon";
import { Username } from "./UserShort";

type UserProps = Omit<CheckboxProps, "children"> & { user: User };

export default function UserCheckbox({ user, ...props }: UserProps) {
    return (
        <Checkbox {...props}>
            <UserIcon target={user} size={32} />
            <Username user={user} />
        </Checkbox>
    );
}
