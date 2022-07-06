import { Text } from "preact-i18n";

import { Column, ModalForm } from "@revoltchat/ui";

import UserIcon from "../../../components/common/user/UserIcon";
import { ModalProps } from "../types";

/**
 * Ban member modal
 */
export default function BanMember({
    member,
    ...props
}: ModalProps<"ban_member">) {
    return (
        <ModalForm
            {...props}
            title={<Text id={`app.context_menu.ban_member`} />}
            schema={{
                member: "custom",
                reason: "text",
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
                reason: {
                    field: (
                        <Text id="app.special.modals.prompt.confirm_ban_reason" />
                    ) as React.ReactChild,
                },
            }}
            callback={async ({ reason }) =>
                void (await member.server!.banUser(member._id.user, { reason }))
            }
            submit={{
                palette: "error",
                children: <Text id="app.special.modals.actions.ban" />,
            }}
        />
    );
}
