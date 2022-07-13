import { Text } from "preact-i18n";

import { Column, ModalForm } from "@revoltchat/ui";

import UserIcon from "../../../components/common/user/UserIcon";
import { ModalProps } from "../types";

/**
 * Kick member modal
 */
export default function KickMember({
    member,
    ...props
}: ModalProps<"kick_member">) {
    return (
        <ModalForm
            {...props}
            title={<Text id={`app.context_menu.kick_member`} />}
            schema={{
                member: "custom",
            }}
            data={{
                member: {
                    element: (
                        <Column centred>
                            <UserIcon target={member.user} size={64} />
                            <Text
                                id="app.special.modals.prompt.confirm_kick"
                                fields={{ name: member.user?.username }}
                            />
                        </Column>
                    ),
                },
            }}
            callback={() => member.kick()}
            submit={{
                palette: "error",
                children: <Text id="app.special.modals.actions.kick" />,
            }}
        />
    );
}
