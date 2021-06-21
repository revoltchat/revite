import { Text } from "preact-i18n";
import styled from "styled-components";
import { UploadState } from "../MessageBox";
import { useEffect, useState } from 'preact/hooks';
import { XCircle, Plus, Share, X } from "@styled-icons/feather";
import { determineFileSize } from '../../../../lib/fileSize';

interface Props {
    state: UploadState,
    addFile: () => void,
    removeFile: (index: number) => void
}

const Container = styled.div`
    gap: 4px;
    padding: 8px;
    display: flex;
    user-select: none;
    flex-direction: column;
    background: var(--message-box);
`;

const Carousel = styled.div`
    gap: 8px;
    display: flex;
    overflow-x: scroll;
    flex-direction: row;
`;

const Entry = styled.div`
    display: flex;
    flex-direction: column;

    img {
        height: 100px;
        margin-bottom: 4px;
        border-radius: 4px;
        object-fit: contain;
        background: var(--secondary-background);
    }

    span.fn {
        margin: auto;
        font-size: .8em;
        overflow: hidden;
        max-width: 180px;
        text-align: center;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: var(--secondary-foreground);
    }

    span.size {
        font-size: .6em;
        color: var(--tertiary-foreground);
        text-align: center;
    }

    div {
        position: relative;
        height: 0;

        div {
            display: grid;
            height: 100px;
            cursor: pointer;
            border-radius: 4px;
            place-items: center;
            
            opacity: 0;
            transition: 0.1s ease opacity;
            background: rgba(0, 0, 0, 0.5);

            &:hover {
                opacity: 1;
            }
        }
    }
`;

const Description = styled.div`
    gap: 4px;
    display: flex;
    font-size: 0.9em;
    align-items: center;
    color: var(--secondary-foreground);
`;

const EmptyEntry = styled.div`
    width: 100px;
    height: 100px;
    display: grid;
    flex-shrink: 0;
    cursor: pointer;
    border-radius: 4px;
    place-items: center;
    background: var(--primary-background);
    transition: 0.1s ease background-color;

    &:hover {
        background: var(--secondary-background);
    }
`;

function FileEntry({ file, remove }: { file: File, remove?: () => void }) {
    if (!file.type.startsWith('image/')) return (
        <Entry>
            <div><div onClick={remove}><XCircle size={36} /></div></div>
            
            <span class="fn">{file.name}</span>
            <span class="size">{determineFileSize(file.size)}</span>
        </Entry>
    );

    const [ url, setURL ] = useState('');

    useEffect(() => {
        let url: string = URL.createObjectURL(file);
        setURL(url);
        return () => URL.revokeObjectURL(url);
    }, [ file ]);

    return (
        <Entry>
            { remove && <div><div onClick={remove}><XCircle size={36} /></div></div> }
            <img src={url}
                 alt={file.name} />
            <span class="fn">{file.name}</span>
            <span class="size">{determineFileSize(file.size)}</span>
        </Entry>
    )
}

export default function FilePreview({ state, addFile, removeFile }: Props) {
    if (state.type === 'none') return null;

    return (
        <Container>
            <Carousel>
                { state.files.map((file, index) => <FileEntry file={file} key={file.name} remove={state.type === 'attached' ? () => removeFile(index) : undefined} />) }
                { state.type === 'attached' && <EmptyEntry onClick={addFile}><Plus size={48} /></EmptyEntry> }
            </Carousel>
            { state.files.length > 1 && state.type === 'attached' && <Description>Warning: Only first file will be uploaded, this will be changed in a future update.</Description> }
            { state.type === 'uploading' && <Description>
                <Share size={24} />
                <Text id="app.main.channel.uploading_file" /> ({state.percent}%)
            </Description> }
            { state.type === 'sending' && <Description>
                <Share size={24} />
                Sending...
            </Description> }
            { state.type === 'failed' && <Description>
                <X size={24} />
                <Text id={`error.${state.error}`} />
            </Description> }
        </Container>
    );
}
