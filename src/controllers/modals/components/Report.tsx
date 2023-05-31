import { API, Message as MessageInterface, User } from "revolt.js";
import styled from "styled-components";

import { Text } from "preact-i18n";

import { ModalForm, Row } from "@revoltchat/ui";

import Message from "../../../components/common/messaging/Message";
import UserShort from "../../../components/common/user/UserShort";
import { useClient } from "../../client/ClientController";
import { modalController } from "../ModalController";
import { ModalProps } from "../types";

const CONTENT_REASONS: API.ContentReportReason[] = [
    "NoneSpecified",
    "Illegal",
    "PromotesHarm",
    "SpamAbuse",
    "Malware",
    "Harassment",
];

const USER_REASONS: API.UserReportReason[] = [
    "NoneSpecified",
    "SpamAbuse",
    "InappropriateProfile",
    "Impersonation",
    "BanEvasion",
    "Underage",
];

/**
 * Add padding to the message container
 */
const MessageContainer = styled.div`
    margin-block-end: 16px;
`;

/**
 * Report creation modal
 */
export default function ReportContent({
    target,
    messageId,
    ...props
}: ModalProps<"report">) {
    const client = useClient();

    return (
        <ModalForm
            {...props}
            title={
                target instanceof MessageInterface ? (
                    <Text id="app.special.modals.report.message" />
                ) : (
                    <Text
                        id="app.special.modals.report.by_name"
                        fields={{
                            name:
                                target instanceof User
                                    ? target.username
                                    : target.name,
                        }}
                    />
                )
            }
            schema={{
                selected: "custom",
                reason: "combo",
                additional_context: "text",
            }}
            data={{
                selected: {
                    element:
                        target instanceof MessageInterface ? (
                            <MessageContainer>
                                <Message message={target} head attachContext />
                            </MessageContainer>
                        ) : target instanceof User ? (
                            <Row centred>
                                <UserShort user={target} size={32} />
                            </Row>
                        ) : (
                            <></>
                        ),
                },
                reason: {
                    field: (
                        <Text id="app.special.modals.report.reason" />
                    ) as React.ReactChild,
                    options: (target instanceof User
                        ? USER_REASONS
                        : CONTENT_REASONS
                    ).map((value) => ({
                        name: (
                            <Text
                                id={
                                    value === "NoneSpecified"
                                        ? "app.special.modals.report.no_reason"
                                        : `app.special.modals.report.${
                                              target instanceof User
                                                  ? "user"
                                                  : "content"
                                          }_reason.${value}`
                                }
                            />
                        ),
                        value,
                    })),
                },
                additional_context: {
                    field: (
                        <Text id="app.special.modals.report.additional_context" />
                    ) as React.ReactChild,
                },
            }}
            callback={async ({ reason, additional_context }) => {
                await client.api.post("/safety/report", {
                    content: {
                        id: target._id,
                        type:
                            target instanceof MessageInterface
                                ? "Message"
                                : target instanceof User
                                ? "User"
                                : "Server",
                        report_reason: reason as any,
                        message_id: messageId,
                    },
                    additional_context,
                });

                modalController.push({
                    type: "report_success",
                    user:
                        target instanceof MessageInterface
                            ? target.author
                            : target instanceof User
                            ? target
                            : undefined,
                });
            }}
            submit={{
                children: <Text id="app.special.modals.actions.report" />,
            }}
        />
    );
}
