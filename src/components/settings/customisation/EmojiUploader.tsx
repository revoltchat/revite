import { Server } from "revolt.js";

import { useState } from "preact/hooks";

import { Form } from "@revoltchat/ui";

import { FileUploader } from "../../../controllers/client/jsx/legacy/FileUploads";

interface Props {
    server: Server;
}

export function EmojiUploader({ server }: Props) {
    const [fileId, setFileId] = useState<string>();

    return (
        <>
            <h3>Upload Emoji</h3>
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
                submitBtn={{
                    children: "Save",
                    palette: "secondary",
                    disabled: !fileId,
                }}
                onSubmit={async ({ name }) => {
                    await server.client.api.put(`/custom/emoji/${fileId}`, {
                        name,
                        parent: { type: "Server", id: server._id },
                    });

                    setFileId("");
                }}
            />
        </>
    );
}
