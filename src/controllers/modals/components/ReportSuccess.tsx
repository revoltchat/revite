import { Text } from "preact-i18n";

import { Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { ModalProps } from "../types";

/**
 * Report success modal
 */
export default function ReportSuccess({
    user,
    ...props
}: ModalProps<"report_success">) {
    return (
        <Modal
            {...props}
            title={<Text id="app.special.modals.report.reported" />}
            description={
                <>
                    <Text id="app.special.modals.report.thank_you" />
                    {user && (
                        <>
                            <br />
                            <br />
                            <Text id="app.special.modals.report.block_user" />
                        </>
                    )}
                </>
            }
            actions={
                user
                    ? [
                          {
                              palette: "plain",
                              onClick: async () => {
                                  user.blockUser();
                                  return true;
                              },
                              children: (
                                  <Text id="app.special.modals.actions.block" />
                              ),
                          },
                          {
                              palette: "plain-secondary",
                              onClick: noopTrue,
                              children: (
                                  <Text id="app.special.modals.actions.dont_block" />
                              ),
                          },
                      ]
                    : [
                          {
                              palette: "plain",
                              onClick: noopTrue,
                              children: (
                                  <Text id="app.special.modals.actions.done" />
                              ),
                          },
                      ]
            }
        />
    );
}
