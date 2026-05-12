import styled from "styled-components";

import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { useLocation } from "react-router-dom";

import { uploadFile } from "../../../controllers/client/jsx/legacy/FileUploads";

import { Tooltip } from "@revoltchat/ui";

import { modalController } from "../../../controllers/modals/ModalController";
import { useClient } from "../../../controllers/client/ClientController";

/**
 * Base codeblock styles
 */
const Base = styled.pre`
    padding: 1em;
    overflow-x: scroll;
    background: var(--block);
    border-radius: var(--border-radius);
`;

/**
 * Copy codeblock contents button styles
 */
const Lang = styled.div`
    font-family: var(--monospace-font);
    width: fit-content;
    padding-bottom: 8px;

    a {
        color: #111;
        cursor: pointer;
        padding: 2px 6px;
        font-weight: 600;
        user-select: none;
        display: inline-block;
        background: #F4B978;

        font-size: 10px;
        text-transform: uppercase;
        box-shadow: 0 2px #787676;
        border-radius: calc(var(--border-radius) / 3);

        &:active {
            transform: translateY(1px);
            box-shadow: 0 1px #787676;
        }
    }
`;

// --- Otto form block styles ---

const FormWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 0;
    background: var(--secondary-background);
    border: 1px solid var(--tertiary-background);
    border-top: 3px solid var(--accent);
    border-radius: var(--border-radius);
    max-width: 480px;
    overflow: hidden;
`;

const FormTitle = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: var(--foreground);
    padding: 12px 16px 0;
`;

const FormBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 16px 16px;
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const FormLabel = styled.label`
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--secondary-foreground);
    letter-spacing: 0.7px;
`;

const inputBase = `
    padding: 8px 11px;
    border-radius: calc(var(--border-radius) / 1.5);
    background: var(--background);
    border: 1.5px solid var(--tertiary-background);
    color: var(--foreground);
    font-size: 13px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
    &:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(255, 160, 60, 0.12);
    }
    &::placeholder {
        color: var(--tertiary-foreground);
        opacity: 0.7;
    }
`;

const FormInput = styled.input`${inputBase}`;

const FormTextarea = styled.textarea`
    ${inputBase}
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
`;

const FormSelect = styled.select`
    ${inputBase}
    cursor: pointer;
    appearance: auto;
`;

const RadioGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const RadioChip = styled.label<{ checked: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1.5px solid ${p => p.checked ? "var(--accent)" : "var(--tertiary-background)"};
    background: ${p => p.checked ? "rgba(255,160,60,0.12)" : "var(--background)"};
    color: ${p => p.checked ? "var(--accent)" : "var(--secondary-foreground)"};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    user-select: none;
    input { display: none; }
    &:hover {
        border-color: var(--accent);
        color: var(--accent);
    }
`;

const FormDivider = styled.div`
    height: 1px;
    background: var(--tertiary-background);
    margin: 0 -16px;
    width: calc(100% + 32px);
`;

const QuestionHeader = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: var(--foreground);
    letter-spacing: 0.2px;
`;

const QuestionRule = styled.div`
    height: 2px;
    background: var(--accent);
    border-radius: 1px;
    margin: 4px 0 8px;
    opacity: 0.5;
`;

const QuestionDesc = styled.div`
    font-size: 13px;
    color: var(--secondary-foreground);
    line-height: 1.5;
    margin-bottom: 8px;
`;

const QuestionInput = styled.input`
    ${inputBase}
    font-size: 15px;
    padding: 11px 14px;
    caret-color: var(--accent);
    caret-shape: bar;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(255, 160, 60, 0.1);
    &:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 4px rgba(255, 160, 60, 0.18);
    }
`;

const FormSubmit = styled.button`
    align-self: flex-start;
    padding: 8px 20px;
    border-radius: var(--border-radius);
    background: #F4B978;
    color: #080c18;
    font-size: 13px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    &:hover:not(:disabled) {
        opacity: 0.88;
        transform: translateY(-1px);
    }
    &:active:not(:disabled) {
        transform: translateY(0);
    }
    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`;

const FormSuccess = styled.div`
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: #4ade80;
    font-weight: 600;
    padding: 10px 16px;
`;

interface OttoFormField {
    type: "text" | "textarea" | "combo" | "radio" | "checkbox" | "file" | "upload" | "select" | "question";
    key: string;
    field: string;
    description?: string;
    value?: string;
    placeholder?: string;
    accept?: string;
    options?: string[];
    choices?: string[];
}

interface OttoFormSchema {
    title?: string;
    messageId?: string;
    fields: OttoFormField[];
    submit?: string;
}

function UploadField({
    accept, file, progress, dragging,
    onFile, onRemove, onDragOver, onDragLeave,
}: {
    accept?: string;
    file?: File;
    progress?: number;
    dragging: boolean;
    onFile: (f: File) => void;
    onRemove: () => void;
    onDragOver: () => void;
    onDragLeave: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            {file ? (
                <FilePreview>
                    <span>📄</span>
                    <FilePreviewName>{file.name}</FilePreviewName>
                    <FilePreviewSize>{fmtBytes(file.size)}</FilePreviewSize>
                    <FilePreviewRemove onClick={onRemove}>×</FilePreviewRemove>
                </FilePreview>
            ) : (
                <UploadZone
                    dragging={dragging}
                    hasFile={false}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); onDragOver(); }}
                    onDragLeave={onDragLeave}
                    onDrop={e => {
                        e.preventDefault();
                        onDragLeave();
                        const f = e.dataTransfer?.files?.[0];
                        if (f) onFile(f);
                    }}
                >
                    <UploadIcon>📂</UploadIcon>
                    <UploadText>Drop your file here or <span>browse</span></UploadText>
                    <UploadHint>{accept ?? "PDF, Word, ePub, or any format"}</UploadHint>
                </UploadZone>
            )}
            {progress !== undefined && progress < 100 && <UploadProgress pct={progress} />}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                style={{ display: "none" }}
                onChange={e => {
                    const f = (e.target as HTMLInputElement).files?.[0];
                    if (f) onFile(f);
                }}
            />
        </div>
    );
}

function OttoFormBlock({ raw }: { raw: string }) {
    const client = useClient();
    const location = useLocation();

    let schema: OttoFormSchema;
    try {
        schema = JSON.parse(raw);
    } catch {
        return <Base><code>{raw}</code></Base>;
    }

    const [values, setValues] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        schema.fields.forEach((f) => { if (f.value) init[f.key] = f.value; });
        return init;
    });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<Record<string, File>>({});
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [draggingOver, setDraggingOver] = useState<string | null>(null);
    const [askOttoField, setAskOttoField] = useState<{ key: string; text: string } | null>(null);

    const serverId = location.pathname.match(/\/server\/([A-Z0-9]{26})/i)?.[1] ?? "";

    const set = (key: string) => (e: Event) =>
        setValues((v) => ({ ...v, [key]: (e.target as HTMLInputElement).value }));

    async function handleSubmit() {
        if (sending || submitted) return;
        setSending(true);
        try {
            const channelId = location.pathname.match(/\/channel\/([A-Z0-9]{26})/i)?.[1];
            const channel = channelId ? (client as any)?.channels?.get(channelId) : null;
            if (!channel) return;

            // Upload any file fields first
            const attachmentIds: string[] = [];
            const autumnUrl = (client as any)?.configuration?.features?.autumn?.url as string | undefined;
            for (const [key, file] of Object.entries(uploadFiles)) {
                if (autumnUrl) {
                    const id = await uploadFile(autumnUrl, "attachments", file, {
                        onUploadProgress: (e: any) => {
                            const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 50;
                            setUploadProgress(p => ({ ...p, [key]: pct }));
                        },
                    });
                    if (id) attachmentIds.push(id);
                }
            }

            const lines = schema.fields
                .filter((f) => f.type !== "upload" && f.type !== "file" && values[f.key] !== undefined && values[f.key] !== "")
                .map((f) => `${f.field}: ${values[f.key]}`);

            await channel.sendMessage({
                content: lines.join("\n") || undefined,
                attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
            });
            setSubmitted(true);
        } finally {
            setSending(false);
        }
    }

    if (submitted) {
        return (
            <FormWrap>
                <FormSuccess>✓ Got it — Otto will continue shortly.</FormSuccess>
            </FormWrap>
        );
    }

    return (
        <>
        <FormWrap>
            {schema.title && <FormTitle>{schema.title}</FormTitle>}
            <FormBody>
                {schema.fields.map((field) => field.type === "question" ? (
                    <FormField key={field.key}>
                        <AskOttoLink onClick={() => setAskOttoField({ key: field.key, text: field.description ?? field.field })}>
                            {field.field}
                        </AskOttoLink>
                    </FormField>
                ) : (
                    <FormField key={field.key}>
                        <FormLabel>{field.field}</FormLabel>
                        {field.type === "upload" || field.type === "file" ? (
                            <UploadField
                                accept={field.accept}
                                file={uploadFiles[field.key]}
                                progress={uploadProgress[field.key]}
                                dragging={draggingOver === field.key}
                                onFile={f => setUploadFiles(p => ({ ...p, [field.key]: f }))}
                                onRemove={() => setUploadFiles(p => { const n = {...p}; delete n[field.key]; return n; })}
                                onDragOver={() => setDraggingOver(field.key)}
                                onDragLeave={() => setDraggingOver(null)}
                            />
                        ) : field.type === "textarea" ? (
                            <FormTextarea
                                value={values[field.key] ?? ""}
                                placeholder={field.placeholder}
                                onInput={set(field.key)}
                            />
                        ) : field.type === "combo" || field.type === "select" ? (
                            <FormSelect value={values[field.key] ?? ""} onChange={set(field.key)}>
                                <option value="">Select...</option>
                                {(field.options ?? field.choices ?? []).map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </FormSelect>
                        ) : field.type === "radio" ? (
                            <RadioGroup>
                                {(field.choices ?? []).map((choice) => (
                                    <RadioChip key={choice} checked={values[field.key] === choice}>
                                        <input
                                            type="radio"
                                            name={field.key}
                                            value={choice}
                                            checked={values[field.key] === choice}
                                            onChange={set(field.key)}
                                        />
                                        {choice}
                                    </RadioChip>
                                ))}
                            </RadioGroup>
                        ) : (
                            <FormInput
                                type="text"
                                value={values[field.key] ?? ""}
                                placeholder={field.placeholder}
                                onInput={set(field.key)}
                            />
                        )}
                    </FormField>
                ))}
                <FormDivider />
                <FormSubmit disabled={sending} onClick={handleSubmit}>
                    {sending ? "Sending..." : (schema.submit ?? "Submit")}
                </FormSubmit>
            </FormBody>
        </FormWrap>
        {askOttoField && (
            <AskOttoModal
                serverId={serverId}
                messageId={schema.messageId ?? ""}
                questionKey={askOttoField.key}
                questionText={askOttoField.text}
                onClose={() => setAskOttoField(null)}
            />
        )}
        </>
    );
}

const UploadZone = styled.div<{ dragging: boolean; hasFile: boolean }>`
    border: 2px dashed ${p => p.dragging ? "var(--accent)" : p.hasFile ? "var(--accent)" : "var(--tertiary-background)"};
    border-radius: var(--border-radius);
    padding: 28px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: ${p => p.dragging ? "rgba(255,160,60,0.08)" : "var(--background)"};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    &:hover {
        border-color: var(--accent);
        background: rgba(255,160,60,0.05);
    }
`;

const UploadIcon = styled.div`
    font-size: 28px;
    line-height: 1;
    opacity: 0.6;
`;

const UploadText = styled.div`
    font-size: 13px;
    color: var(--secondary-foreground);
    span { color: var(--accent); font-weight: 600; }
`;

const UploadHint = styled.div`
    font-size: 11px;
    color: var(--tertiary-foreground);
`;

const FilePreview = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    background: var(--background);
    border: 1.5px solid var(--accent);
    border-radius: calc(var(--border-radius) / 1.5);
    font-size: 13px;
`;

const FilePreviewName = styled.div`
    flex: 1;
    font-weight: 600;
    color: var(--foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const FilePreviewSize = styled.div`
    font-size: 11px;
    color: var(--tertiary-foreground);
    white-space: nowrap;
`;

const FilePreviewRemove = styled.button`
    background: none;
    border: none;
    color: var(--tertiary-foreground);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0 2px;
    &:hover { color: var(--foreground); }
`;

const UploadProgress = styled.div<{ pct: number }>`
    width: 100%;
    height: 3px;
    background: var(--tertiary-background);
    border-radius: 2px;
    overflow: hidden;
    &::after {
        content: "";
        display: block;
        height: 100%;
        width: ${p => p.pct}%;
        background: var(--accent);
        transition: width 0.2s;
    }
`;

function fmtBytes(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

const AskOttoLink = styled.button`
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    font-size: 12px;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    align-self: flex-start;
    margin-top: 4px;
    &:hover { opacity: 0.75; }
`;

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
`;

const ModalBox = styled.div`
    background: var(--secondary-background);
    border: 1px solid var(--tertiary-background);
    border-top: 3px solid var(--accent);
    border-radius: var(--border-radius);
    width: 420px;
    max-width: 95vw;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--tertiary-background);
    font-size: 13px;
    font-weight: 700;
    color: var(--foreground);
`;

const ModalClose = styled.button`
    background: none;
    border: none;
    color: var(--secondary-foreground);
    font-size: 18px;
    cursor: pointer;
    line-height: 1;
    padding: 0 2px;
    &:hover { color: var(--foreground); }
`;

const ModalMessages = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ModalMsg = styled.div<{ self: boolean }>`
    align-self: ${p => p.self ? "flex-end" : "flex-start"};
    max-width: 85%;
    padding: 7px 11px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.45;
    background: ${p => p.self ? "#F4B978" : "var(--background)"};
    color: ${p => p.self ? "#080c18" : "var(--foreground)"};
    border: ${p => p.self ? "none" : "1px solid var(--tertiary-background)"};
    white-space: pre-wrap;
    word-break: break-word;
`;

const ModalInputRow = styled.div`
    display: flex;
    gap: 8px;
    padding: 10px 14px;
    border-top: 1px solid var(--tertiary-background);
`;

const ModalInput = styled.input`
    ${inputBase}
    flex: 1;
    font-size: 13px;
`;

const ModalSend = styled.button`
    padding: 8px 14px;
    background: #F4B978;
    color: #080c18;
    border: none;
    border-radius: calc(var(--border-radius) / 1.5);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const OTTO_API = "https://otto.apricotter.com";

interface ChatMessage { id: string; content: string; self: boolean; }

function AskOttoModal({
    serverId,
    messageId,
    questionKey,
    questionText,
    onClose,
}: {
    serverId: string;
    messageId: string;
    questionKey: string;
    questionText: string;
    onClose: () => void;
}) {
    const client = useClient();
    const [channelId, setChannelId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Create/fetch the question group channel
    useEffect(() => {
        fetch(`${OTTO_API}/question-group`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serverId, messageId, questionKey, questionText }),
        })
            .then(r => r.json())
            .then((data: any) => {
                if (data.channelId) setChannelId(data.channelId);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [serverId, messageId, questionKey]);

    // Load recent messages when channel is ready
    useEffect(() => {
        if (!channelId) return;
        const ch = (client as any)?.channels?.get(channelId);
        ch?.fetchMessages?.({ limit: 25 })
            .then((msgs: any[]) => {
                if (!msgs) return;
                const selfId = (client as any)?.user?.id;
                setMessages(msgs.reverse().map((m: any) => ({
                    id: m.id ?? m._id,
                    content: m.content ?? "",
                    self: m.authorId === selfId || m.author_id === selfId,
                })));
            })
            .catch(() => {});
    }, [channelId]);

    // Subscribe to new messages
    useEffect(() => {
        if (!channelId) return;
        const selfId = (client as any)?.user?.id;
        const handler = (msg: any) => {
            const msgChannelId = msg.channelId ?? msg.channel_id;
            if (msgChannelId !== channelId) return;
            setMessages(prev => [...prev, {
                id: msg.id ?? msg._id,
                content: msg.content ?? "",
                self: (msg.authorId ?? msg.author_id) === selfId,
            }]);
        };
        (client as any)?.on?.("message", handler);
        return () => (client as any)?.off?.("message", handler);
    }, [channelId, client]);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        if (!input.trim() || !channelId || sending) return;
        const ch = (client as any)?.channels?.get(channelId);
        if (!ch) return;
        setSending(true);
        try {
            await ch.sendMessage({ content: input.trim() });
            setInput("");
        } finally {
            setSending(false);
        }
    };

    return (
        <ModalOverlay onClick={e => e.target === e.currentTarget && onClose()}>
            <ModalBox>
                <ModalHeader>
                    <span>Ask Otto — {questionText.length > 40 ? questionText.slice(0, 40) + "…" : questionText}</span>
                    <ModalClose onClick={onClose}>×</ModalClose>
                </ModalHeader>
                <ModalMessages>
                    {loading && <ModalMsg self={false}>Connecting…</ModalMsg>}
                    {messages.map(m => (
                        <ModalMsg key={m.id} self={m.self}>{m.content}</ModalMsg>
                    ))}
                    <div ref={bottomRef} />
                </ModalMessages>
                <ModalInputRow>
                    <ModalInput
                        type="text"
                        placeholder="Ask Otto…"
                        value={input}
                        onInput={e => setInput((e.target as HTMLInputElement).value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        autoFocus
                    />
                    <ModalSend disabled={sending || !input.trim()} onClick={send}>Send</ModalSend>
                </ModalInputRow>
            </ModalBox>
        </ModalOverlay>
    );
}

// --- Greeting block ---

const GreetingWrap = styled.div`
    background: var(--secondary-background);
    border: 1px solid var(--tertiary-background);
    border-top: 3px solid var(--accent);
    border-radius: var(--border-radius);
    max-width: 480px;
    overflow: hidden;
    padding: 20px 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const GreetingTitle = styled.div`
    font-size: 17px;
    font-weight: 800;
    color: var(--foreground);
    letter-spacing: -0.2px;
`;

const GreetingDesc = styled.div`
    font-size: 13px;
    color: var(--secondary-foreground);
    line-height: 1.55;
`;

const GreetingSteps = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const GreetingStep = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--foreground);
`;

const GreetingStepNum = styled.div`
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #F4B978;
    color: #080c18;
    font-size: 11px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

interface GreetingSchema {
    title: string;
    description?: string;
    steps?: string[];
}

function GreetingBlock({ raw }: { raw: string }) {
    let schema: GreetingSchema;
    try {
        schema = JSON.parse(raw);
    } catch {
        return null;
    }
    return (
        <GreetingWrap>
            <GreetingTitle>{schema.title}</GreetingTitle>
            {schema.description && <GreetingDesc>{schema.description}</GreetingDesc>}
            {schema.steps && schema.steps.length > 0 && (
                <GreetingSteps>
                    {schema.steps.map((step, i) => (
                        <GreetingStep key={i}>
                            <GreetingStepNum>{i + 1}</GreetingStepNum>
                            {step}
                        </GreetingStep>
                    ))}
                </GreetingSteps>
            )}
        </GreetingWrap>
    );
}

const ThinkingDetails = styled.details`
    margin: 4px 0;
    border-radius: var(--border-radius);
    border: 1px solid var(--tertiary-background);
    background: var(--secondary-background);
    font-size: 13px;

    summary {
        padding: 6px 10px;
        cursor: pointer;
        font-weight: 600;
        color: var(--secondary-foreground);
        user-select: none;
        list-style: none;
        display: flex;
        align-items: center;
        gap: 6px;

        &::before {
            content: "▶";
            font-size: 9px;
            transition: transform 0.15s;
        }
    }

    &[open] summary::before {
        transform: rotate(90deg);
    }
`;

const ThinkingBody = styled.div`
    padding: 8px 12px;
    color: var(--tertiary-foreground);
    white-space: pre-wrap;
    font-size: 12px;
    line-height: 1.5;
    border-top: 1px solid var(--tertiary-background);
`;

function ThinkingBlock({ raw }: { raw: string }) {
    return (
        <ThinkingDetails>
            <summary>Otto's Thoughts</summary>
            <ThinkingBody>{raw.trim()}</ThinkingBody>
        </ThinkingDetails>
    );
}

function extractText(node: any): string {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node?.props?.children) return extractText(node.props.children);
    return "";
}

/**
 * Render a codeblock with copy text button, or an Otto form block
 */
export const RenderCodeblock: React.FC<{ class: string }> = ({
    children,
    ...props
}) => {
    const ref = useRef<HTMLPreElement>(null);

    let lang = "text";
    if (props.class) {
        lang = props.class.split("-")[1];
    }

    // Otto interactive form block
    if (lang === "form") {
        return <OttoFormBlock raw={extractText(children)} />;
    }

    if (lang === "greeting") {
        return <GreetingBlock raw={extractText(children)} />;
    }

    // Otto thinking block — collapsible reasoning display
    if (lang === "thinking") {
        return <ThinkingBlock raw={extractText(children)} />;
    }

    const onCopy = useCallback(() => {
        const text = ref.current?.querySelector("code")?.innerText;
        text && modalController.writeText(text);
    }, [ref]);

    return (
        <Base ref={ref}>
            <Lang>
                <Tooltip content="Copy to Clipboard" placement="top">
                    {/**
                    // @ts-expect-error Preact-React */}
                    <a onClick={onCopy}>{lang}</a>
                </Tooltip>
            </Lang>
            {children}
        </Base>
    );
};
