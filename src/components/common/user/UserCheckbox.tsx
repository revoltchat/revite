import { User } from "revolt.js/dist/maps/Users";

import {
    Checkbox,
    Props as CheckboxProps,
} from "@revoltchat/ui/lib/components/atoms/inputs/Checkbox";

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
