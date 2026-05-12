import { observer } from "mobx-react-lite";
import styled from "styled-components/macro";
import { useCallback, useEffect, useState } from "preact/hooks";

import { useClient } from "../../../controllers/client/ClientController";

const AUTUMN_URL = (import.meta.env.VITE_AUTUMN_URL ?? "https://autumn.apricotter.com").replace(/\/$/, "");
const OTTO_URL   = (import.meta.env.VITE_OTTO_URL ?? "").replace(/\/$/, "");

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 20px;
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Input = styled.input`
    padding: 7px 12px;
    border-radius: var(--border-radius);
    border: 1px solid var(--tertiary-background);
    background: var(--secondary-background);
    color: var(--foreground);
    font-size: 13px;
    width: 200px;

    &:focus {
        outline: none;
        border-color: var(--accent);
    }
`;

const Select = styled.select`
    padding: 7px 10px;
    border-radius: var(--border-radius);
    border: 1px solid var(--tertiary-background);
    background: var(--secondary-background);
    color: var(--foreground);
    font-size: 13px;
    cursor: pointer;
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

    &:hover { filter: brightness(1.1); }
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
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Mono = styled.span`
    font-family: monospace;
    font-size: 11px;
    color: var(--secondary-foreground);
`;

const Thumb = styled.img`
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: 4px;
    background: var(--tertiary-background);
`;

const FileIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: var(--tertiary-background);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--secondary-foreground);
    text-transform: uppercase;
`;

const LinkBtn = styled.a`
    font-size: 11px;
    color: var(--accent);
    text-decoration: none;
    padding: 2px 8px;
    border-radius: var(--border-radius);
    border: 1px solid var(--tertiary-background);

    &:hover {
        border-color: var(--accent);
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

const Pagination = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    font-size: 13px;
    color: var(--secondary-foreground);
`;

interface FileMeta {
    _id: string;
    tag: string;
    filename: string;
    content_type: string;
    size: number;
    metadata: { type: string };
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExt(filename: string): string {
    return filename.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";
}

export default observer(() => {
    const client = useClient();
    const token = (client as any)?.session?.token;

    const [files, setFiles] = useState<FileMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tag, setTag] = useState("");
    const [search, setSearch] = useState("");
    const [skip, setSkip] = useState(0);
    const limit = 50;

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (tag) params.set("tag", tag);
            if (search) params.set("search", search);
            params.set("limit", String(limit));
            params.set("skip", String(skip));

            const r = await fetch(`${AUTUMN_URL}/admin/files?${params}`, {
                headers: token ? { "X-Bot-Token": token } : {},
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            setFiles(await r.json());
            setError(null);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }, [tag, search, skip, token]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    function fileUrl(f: FileMeta) {
        return `${AUTUMN_URL}/${f.tag}/${f._id}/${encodeURIComponent(f.filename)}`;
    }

    function isImage(f: FileMeta) {
        return f.content_type.startsWith("image/");
    }

    return (
        <>
            <Header>
                <Title>Files</Title>
                <Controls>
                    <Input
                        placeholder="Search filename..."
                        value={search}
                        onInput={(e) => { setSearch((e.target as HTMLInputElement).value); setSkip(0); }}
                    />
                    <Select value={tag} onChange={(e) => { setTag((e.target as HTMLSelectElement).value); setSkip(0); }}>
                        <option value="">All tags</option>
                        <option value="attachments">attachments</option>
                        <option value="avatars">avatars</option>
                        <option value="backgrounds">backgrounds</option>
                        <option value="icons">icons</option>
                        <option value="banners">banners</option>
                    </Select>
                    <Button onClick={fetchFiles}>Refresh</Button>
                </Controls>
            </Header>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            {loading ? (
                <Empty>Loading...</Empty>
            ) : files.length === 0 ? (
                <Empty>No files found.</Empty>
            ) : (
                <>
                    <Table>
                        <thead>
                            <tr>
                                <Th style={{ width: 44 }} />
                                <Th>Filename</Th>
                                <Th>Tag</Th>
                                <Th>Type</Th>
                                <Th>Size</Th>
                                <Th>ID</Th>
                                <Th />
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((f) => (
                                <tr key={f._id}>
                                    <Td style={{ padding: "8px 12px" }}>
                                        {isImage(f) ? (
                                            <Thumb src={fileUrl(f)} alt="" loading="lazy" />
                                        ) : (
                                            <FileIcon>{fileExt(f.filename)}</FileIcon>
                                        )}
                                    </Td>
                                    <Td title={f.filename}>{f.filename}</Td>
                                    <Td><Mono>{f.tag}</Mono></Td>
                                    <Td><Mono>{f.content_type}</Mono></Td>
                                    <Td><Mono>{formatSize(f.size)}</Mono></Td>
                                    <Td><Mono>{f._id.slice(0, 16)}…</Mono></Td>
                                    <Td>
                                        <LinkBtn href={fileUrl(f)} target="_blank" rel="noreferrer">
                                            Open
                                        </LinkBtn>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        <Button
                            disabled={skip === 0}
                            onClick={() => setSkip(Math.max(0, skip - limit))}
                            style={{ opacity: skip === 0 ? 0.4 : 1 }}
                        >
                            ← Prev
                        </Button>
                        <span>{skip + 1}–{skip + files.length}</span>
                        <Button
                            disabled={files.length < limit}
                            onClick={() => setSkip(skip + limit)}
                            style={{ opacity: files.length < limit ? 0.4 : 1 }}
                        >
                            Next →
                        </Button>
                    </Pagination>
                </>
            )}
        </>
    );
});
