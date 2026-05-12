import { observer } from "mobx-react-lite";
import styled from "styled-components/macro";
import { useCallback, useEffect, useState } from "preact/hooks";

const OTTO_URL = (import.meta.env.VITE_OTTO_URL ?? "").replace(/\/$/, "");

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
`;

const TitleBlock = styled.div``;

const Title = styled.h1`
    margin: 0;
    font-size: 20px;
`;

const Subtitle = styled.div`
    margin-top: 4px;
    font-size: 12px;
    color: var(--secondary-foreground);
`;

const Button = styled.button`
    padding: 8px 16px;
    border-radius: var(--border-radius);
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: var(--secondary-background);
    color: var(--foreground);

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

const Mono = styled.span`
    font-family: monospace;
    font-size: 11px;
    color: var(--secondary-foreground);
`;

type StatusType = "running" | "checkpoint" | "complete" | "failed" | "cancelled" | "queued";

const STATUS_COLORS: Record<StatusType, { bg: string; color: string }> = {
    running:    { bg: "rgba(34,197,94,0.15)",  color: "#22c55e" },
    checkpoint: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    complete:   { bg: "var(--tertiary-background)", color: "var(--secondary-foreground)" },
    failed:     { bg: "rgba(239,68,68,0.15)",  color: "#ef4444" },
    cancelled:  { bg: "var(--tertiary-background)", color: "var(--secondary-foreground)" },
    queued:     { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
};

const Badge = styled.span<{ status: StatusType }>`
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: ${(p) => (STATUS_COLORS[p.status] ?? STATUS_COLORS.complete).bg};
    color: ${(p) => (STATUS_COLORS[p.status] ?? STATUS_COLORS.complete).color};
`;

const CancelBtn = styled.button<{ busy?: boolean }>`
    padding: 3px 10px;
    border-radius: var(--border-radius);
    border: 1px solid var(--tertiary-background);
    background: transparent;
    color: ${(p) => (p.busy ? "var(--secondary-foreground)" : "#ef4444")};
    font-size: 11px;
    cursor: ${(p) => (p.busy ? "default" : "pointer")};
    opacity: ${(p) => (p.busy ? 0.5 : 1)};

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.1);
        border-color: #ef4444;
    }
`;

const StepText = styled.span<{ checkpoint?: boolean }>`
    font-size: 12px;
    color: ${(p) => (p.checkpoint ? "#f59e0b" : "var(--secondary-foreground)")};
`;

const Dot = styled.span<{ active?: boolean }>`
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) => (p.active ? "#22c55e" : "var(--secondary-foreground)")};
    margin-right: 6px;
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

const WarnIcon = styled.span`
    margin-left: 6px;
    font-size: 11px;
    color: #ef4444;
    cursor: help;
`;

interface Job {
    id: string;
    serverId: string;
    channelId: string;
    bookSlug: string;
    status: StatusType;
    currentStep: string;
    checkpointStep?: string;
    error?: string;
    createdAt: string;
    updatedAt: string;
}

function elapsed(iso: string): string {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default observer(() => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState<Set<string>>(new Set());
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchJobs = useCallback(async () => {
        if (!OTTO_URL) {
            setError("VITE_OTTO_URL is not set");
            setLoading(false);
            return;
        }
        try {
            const r = await fetch(`${OTTO_URL}/jobs`);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const data: Job[] = await r.json();
            setJobs(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
            setError(null);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
        }
    }, []);

    useEffect(() => {
        fetchJobs();
        const id = setInterval(fetchJobs, 4000);
        return () => clearInterval(id);
    }, []);

    async function cancelJob(id: string) {
        setCancelling((prev) => new Set([...prev, id]));
        try {
            await fetch(`${OTTO_URL}/jobs/${id}/cancel`, { method: "POST" });
            await fetchJobs();
        } finally {
            setCancelling((prev) => {
                const s = new Set(prev);
                s.delete(id);
                return s;
            });
        }
    }

    const canCancel = (status: StatusType) =>
        status === "running" || status === "checkpoint";

    const activeCount = jobs.filter((j) => canCancel(j.status)).length;

    return (
        <>
            <Header>
                <TitleBlock>
                    <Title>Pipeline Jobs</Title>
                    <Subtitle>
                        <Dot active={activeCount > 0} />
                        {activeCount > 0 ? `${activeCount} active` : "No active jobs"}
                        {" · "}
                        refreshed {lastRefresh.toLocaleTimeString()}
                    </Subtitle>
                </TitleBlock>
                <Button onClick={fetchJobs}>Refresh</Button>
            </Header>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            {loading ? (
                <Empty>Loading...</Empty>
            ) : jobs.length === 0 ? (
                <Empty>No pipeline jobs found.</Empty>
            ) : (
                <Table>
                    <thead>
                        <tr>
                            <Th>ID</Th>
                            <Th>Server</Th>
                            <Th>Slug</Th>
                            <Th>Status</Th>
                            <Th>Step</Th>
                            <Th>Started</Th>
                            <Th>Elapsed</Th>
                            <Th />
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job) => (
                            <tr key={job.id}>
                                <Td>
                                    <Mono>{job.id.slice(-8)}</Mono>
                                </Td>
                                <Td>
                                    <Mono>{job.serverId.slice(-8)}</Mono>
                                </Td>
                                <Td>{job.bookSlug || "—"}</Td>
                                <Td>
                                    <Badge status={job.status}>{job.status}</Badge>
                                    {job.error && (
                                        <WarnIcon title={job.error}>⚠</WarnIcon>
                                    )}
                                </Td>
                                <Td>
                                    <StepText checkpoint={!!job.checkpointStep}>
                                        {job.checkpointStep
                                            ? `⏸ ${job.checkpointStep}`
                                            : job.currentStep || "—"}
                                    </StepText>
                                </Td>
                                <Td>
                                    <Mono>
                                        {new Date(job.createdAt).toLocaleString()}
                                    </Mono>
                                </Td>
                                <Td>
                                    <Mono>{elapsed(job.createdAt)}</Mono>
                                </Td>
                                <Td>
                                    {canCancel(job.status) && (
                                        <CancelBtn
                                            busy={cancelling.has(job.id)}
                                            disabled={cancelling.has(job.id)}
                                            onClick={() => cancelJob(job.id)}
                                        >
                                            {cancelling.has(job.id)
                                                ? "Cancelling…"
                                                : "Cancel"}
                                        </CancelBtn>
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
