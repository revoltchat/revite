import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import styled from "styled-components/macro";

import { useEffect, useState } from "preact/hooks";

import { useClient } from "../../../controllers/client/ClientController";

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 20px;
`;

const Button = styled.button<{ primary?: boolean }>`
    padding: 8px 16px;
    border-radius: var(--border-radius);
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: ${(p) => (p.primary ? "var(--accent)" : "var(--secondary-background)")};
    color: ${(p) => (p.primary ? "white" : "var(--foreground)")};

    &:hover {
        filter: brightness(1.1);
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
`;

const Th = styled.th`
    text-align: left;
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-foreground);
    border-bottom: 1px solid var(--tertiary-background);
`;

const Td = styled.td`
    padding: 10px 12px;
    border-bottom: 1px solid var(--tertiary-background);
    color: var(--foreground);
    vertical-align: middle;
`;

const Badge = styled.span<{ used: boolean }>`
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
    background: ${(p) => (p.used ? "var(--tertiary-background)" : "rgba(var(--accent-rgb, 0,0,0), 0.15)")};
    color: ${(p) => (p.used ? "var(--secondary-foreground)" : "var(--accent)")};
`;

const CopyBtn = styled.button`
    padding: 2px 8px;
    border-radius: var(--border-radius);
    border: 1px solid var(--tertiary-background);
    background: transparent;
    color: var(--secondary-foreground);
    font-size: 11px;
    cursor: pointer;

    &:hover {
        color: var(--foreground);
        border-color: var(--foreground);
    }
`;

const Empty = styled.div`
    color: var(--secondary-foreground);
    font-size: 14px;
    padding: 40px 0;
    text-align: center;
`;

const ErrorMsg = styled.div`
    padding: 10px 14px;
    border-radius: var(--border-radius);
    background: var(--error);
    color: white;
    font-size: 13px;
    margin-bottom: 16px;
`;

interface InvitationRecord {
    code: string;
    email: string;
    created_by: string;
    used: boolean;
    used_by?: string;
    created_at: string;
}

export default observer(() => {
    const client = useClient();
    const history = useHistory();
    const [records, setRecords] = useState<InvitationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const token = (client as any)?.session?.token;
        const apiUrl = import.meta.env.VITE_API_URL ?? "";

        fetch(`${apiUrl}/admin/invitations`, {
            headers: token ? { "X-Session-Token": token } : {},
        })
            .then((r) => {
                if (!r.ok) throw new Error(`${r.status}`);
                return r.json();
            })
            .then((data) => {
                setRecords(data.sort((a: InvitationRecord, b: InvitationRecord) =>
                    b.created_at.localeCompare(a.created_at),
                ));
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    function copyLink(code: string) {
        navigator.clipboard.writeText(`${window.location.origin}/signup?code=${code}`).then(() => {
            setCopied(code);
            setTimeout(() => setCopied(null), 2000);
        });
    }

    function formatDate(s: string) {
        const d = new Date(s);
        return isNaN(d.getTime()) ? s : d.toLocaleDateString();
    }

    return (
        <>
            <Header>
                <Title>Clients</Title>
                <Button primary onClick={() => history.push("/admin/clients/new")}>
                    + Invite Prospect
                </Button>
            </Header>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            {loading ? (
                <Empty>Loading...</Empty>
            ) : records.length === 0 ? (
                <Empty>No clients yet. Invite your first prospect.</Empty>
            ) : (
                <Table>
                    <thead>
                        <tr>
                            <Th>Email</Th>
                            <Th>Status</Th>
                            <Th>Created</Th>
                            <Th />
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r) => (
                            <tr key={r.code}>
                                <Td>{r.email}</Td>
                                <Td>
                                    <Badge used={r.used}>
                                        {r.used ? "Signed up" : "Pending"}
                                    </Badge>
                                </Td>
                                <Td>{formatDate(r.created_at)}</Td>
                                <Td>
                                    {!r.used && (
                                        <CopyBtn onClick={() => copyLink(r.code)}>
                                            {copied === r.code ? "Copied!" : "Copy link"}
                                        </CopyBtn>
                                    )}
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </>
    );
});
