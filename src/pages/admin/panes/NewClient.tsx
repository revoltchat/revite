import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import styled from "styled-components/macro";

import { useEffect, useState } from "preact/hooks";

import { useClient } from "../../../controllers/client/ClientController";

// --- Styled components ---

const Title = styled.h1`
    margin-bottom: 20px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;
`;

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--secondary-foreground);
`;

const Input = styled.input`
    padding: 8px 12px;
    border-radius: var(--border-radius);
    background: var(--secondary-background);
    border: 1px solid var(--tertiary-background);
    color: var(--foreground);
    font-size: 14px;
    outline: none;
    &:focus { border-color: var(--accent); }
`;

const Select = styled.select`
    padding: 8px 12px;
    border-radius: var(--border-radius);
    background: var(--secondary-background);
    border: 1px solid var(--tertiary-background);
    color: var(--foreground);
    font-size: 14px;
    outline: none;
    &:focus { border-color: var(--accent); }
`;

const Textarea = styled.textarea`
    padding: 8px 12px;
    border-radius: var(--border-radius);
    background: var(--secondary-background);
    border: 1px solid var(--tertiary-background);
    color: var(--foreground);
    font-size: 14px;
    outline: none;
    resize: vertical;
    min-height: 80px;
    &:focus { border-color: var(--accent); }
`;

const Button = styled.button<{ primary?: boolean }>`
    padding: 10px 20px;
    border-radius: var(--border-radius);
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background: ${(p) => (p.primary ? "var(--accent)" : "var(--secondary-background)")};
    color: ${(p) => (p.primary ? "white" : "var(--foreground)")};
    &:hover { filter: brightness(1.1); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 8px;
`;

const ErrorMsg = styled.div`
    padding: 10px 14px;
    border-radius: var(--border-radius);
    background: var(--error);
    color: white;
    font-size: 13px;
`;

const SuccessBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;
`;

const InviteLink = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    background: var(--secondary-background);
    border-radius: var(--border-radius);
    padding: 10px 14px;
    font-size: 13px;
    font-family: monospace;
    word-break: break-all;
    color: var(--foreground);
`;

const Hint = styled.span`
    font-size: 12px;
    color: var(--secondary-foreground);
`;

// --- Schema ---

type FieldType = "text" | "email" | "url" | "textarea" | "select";

interface FieldDef {
    key: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: string[];
    placeholder?: string;
}

interface VerticalSchema {
    label: string;
    nameField: string;
    fields: FieldDef[];
}

const VERTICAL_SCHEMAS: Record<string, VerticalSchema> = {
    author: {
        label: "Author",
        nameField: "name",
        fields: [
            { key: "name", label: "Author Name", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "website", label: "Website URL", type: "url" },
            { key: "kdp", label: "Amazon KDP URL", type: "url" },
            { key: "instagram", label: "Instagram Handle", type: "text", placeholder: "@handle" },
            { key: "tiktok", label: "TikTok Handle", type: "text", placeholder: "@handle" },
            { key: "facebook", label: "Facebook Page URL", type: "url" },
            { key: "notes", label: "Notes", type: "textarea" },
        ],
    },
    home_services: {
        label: "Home Services",
        nameField: "businessName",
        fields: [
            { key: "businessName", label: "Business Name", type: "text", required: true },
            { key: "ownerName", label: "Owner Name", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "serviceType", label: "Service Type", type: "text", placeholder: "e.g. Landscaping, Plumbing, Roofing" },
            { key: "googleBusiness", label: "Google Business URL", type: "url" },
            { key: "facebook", label: "Facebook Page URL", type: "url" },
            { key: "instagram", label: "Instagram Handle", type: "text", placeholder: "@handle" },
            { key: "serviceArea", label: "Service Area / City", type: "text" },
            { key: "website", label: "Website URL", type: "url" },
            { key: "notes", label: "Notes", type: "textarea" },
        ],
    },
};

// --- DynamicForm ---

interface DynamicFormProps {
    vertical: string;
    onSuccess: (url: string, name: string) => void;
}

function DynamicForm({ vertical, onSuccess }: DynamicFormProps) {
    const client = useClient();
    const schema = VERTICAL_SCHEMAS[vertical];
    const [fields, setFields] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFields({});
        setError(null);
    }, [vertical]);

    function set(key: string) {
        return (e: Event) =>
            setFields((f) => ({ ...f, [key]: (e.target as HTMLInputElement).value }));
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = (client as any)?.session?.token;
            const apiUrl = import.meta.env.VITE_API_URL ?? "";
            const { email, ...rest } = fields;
            const metadata = Object.keys(rest).length > 0 ? rest : undefined;

            const resp = await fetch(`${apiUrl}/admin/invitations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "X-Session-Token": token } : {}),
                },
                body: JSON.stringify({ email, vertical, metadata, signup_base: `${window.location.origin}/signup` }),
            });

            if (!resp.ok) {
                const text = await resp.text().catch(() => resp.statusText);
                throw new Error(`${resp.status}: ${text}`);
            }

            const data = await resp.json();
            if (!data.signup_url) throw new Error("No signup URL in response");
            onSuccess(data.signup_url, fields[schema.nameField] ?? email);
        } catch (err: any) {
            setError(err?.message ?? String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            {schema.fields.map((field) => (
                <Field key={field.key}>
                    <Label>{field.label}{field.required && " *"}</Label>
                    {field.type === "textarea" ? (
                        <Textarea
                            value={fields[field.key] ?? ""}
                            onInput={set(field.key)}
                            placeholder={field.placeholder}
                        />
                    ) : field.type === "select" ? (
                        <Select
                            value={fields[field.key] ?? ""}
                            onChange={set(field.key)}
                            required={field.required}>
                            <option value="">Select...</option>
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </Select>
                    ) : (
                        <Input
                            type={field.type}
                            required={field.required}
                            value={fields[field.key] ?? ""}
                            onInput={set(field.key)}
                            placeholder={field.placeholder}
                        />
                    )}
                </Field>
            ))}
            <Actions>
                <Button type="submit" primary disabled={loading}>
                    {loading ? "Creating..." : "Create Invite"}
                </Button>
            </Actions>
        </Form>
    );
}

// --- NewClient (outer shell) ---

export default observer(() => {
    const history = useHistory();
    const [selectedVertical, setSelectedVertical] = useState<string | null>(null);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [inviteName, setInviteName] = useState("");
    const [copied, setCopied] = useState(false);

    function copyLink() {
        if (!inviteUrl) return;
        navigator.clipboard.writeText(inviteUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function reset() {
        setSelectedVertical(null);
        setInviteUrl(null);
        setInviteName("");
        setCopied(false);
    }

    if (inviteUrl) {
        return (
            <SuccessBox>
                <Title>Invite created</Title>
                <div>
                    <strong>{inviteName}</strong>
                    {selectedVertical && VERTICAL_SCHEMAS[selectedVertical] && (
                        <span style={{ color: "var(--secondary-foreground)", marginLeft: 8 }}>
                            ({VERTICAL_SCHEMAS[selectedVertical].label})
                        </span>
                    )}
                </div>
                <Field>
                    <Label>Invite link</Label>
                    <InviteLink>
                        <span style={{ flex: 1 }}>{inviteUrl}</span>
                        <Button type="button" onClick={copyLink}>
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </InviteLink>
                    <Hint>Copy this link and send it to the client.</Hint>
                </Field>
                <Actions>
                    <Button type="button" primary onClick={reset}>
                        Invite Another
                    </Button>
                    <Button type="button" onClick={() => history.push("/admin/clients")}>
                        Back to Clients
                    </Button>
                </Actions>
            </SuccessBox>
        );
    }

    return (
        <>
            <Button
                type="button"
                style={{ marginBottom: 16 }}
                onClick={() => history.push("/admin/clients")}>
                ← Back to Clients
            </Button>
            <Title>Invite Prospect</Title>
            <Form as="div">
                <Field>
                    <Label>Client Type *</Label>
                    <Select
                        value={selectedVertical ?? ""}
                        onChange={(e: Event) => {
                            const val = (e.target as HTMLSelectElement).value;
                            setSelectedVertical(val || null);
                        }}>
                        <option value="" disabled>Select a client type...</option>
                        {Object.entries(VERTICAL_SCHEMAS).map(([key, schema]) => (
                            <option key={key} value={key}>{schema.label}</option>
                        ))}
                    </Select>
                </Field>
            </Form>
            {selectedVertical && (
                <div style={{ marginTop: 24 }}>
                    <DynamicForm
                        vertical={selectedVertical}
                        onSuccess={(url, name) => {
                            setInviteUrl(url);
                            setInviteName(name);
                        }}
                    />
                </div>
            )}
        </>
    );
});
