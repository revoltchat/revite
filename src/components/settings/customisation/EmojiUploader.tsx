import { Server } from "revolt.js";

import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { Button, Column, Form, FormElement, Row } from "@revoltchat/ui";

import { FileUploader } from "../../../controllers/client/jsx/legacy/FileUploads";

interface Props {
    server: Server;
}

export function EmojiUploader({ server }: Props) {
    const [fileId, setFileId] = useState<string>();

    return (
        <>
            <h3>
                <Text id="app.settings.server_pages.emojis.upload" />
            </h3>
            <Form
                schema={{
                    name: "text",
                    file: "custom",
                }}
                data={{
                    name: {
                        field: "Name",
                        palette: "secondary",
                    },
                    file: {
                        element: (
                            <FileUploader
                                style="icon"
                                width={100}
                                height={100}
                                fileType="emojis"
                                behaviour="upload"
                                previewAfterUpload
                                maxFileSize={500000}
                                remove={async () => void setFileId("")}
                                onUpload={async (id) => void setFileId(id)}
                            />
                        ),
                    },
                }}
                onSubmit={async ({ name }) => {
                    await server.client.api.put(`/custom/emoji/${fileId}`, {
                        name,
                        parent: { type: "Server", id: server._id },
                    });

                    setFileId("");
                }}>
                <Row>
                    <FormElement id="file" />
                    <Column>
                        <FormElement id="name" />
                        <Button
                            type="submit"
                            palette="secondary"
                            disabled={!fileId}>
                            <Text id="app.special.modals.actions.save" />
                        </Button>
                    </Column>
                </Row>
            </Form>
        </>
    );
}
