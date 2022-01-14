import { Check, CloudUpload } from "@styled-icons/boxicons-regular";
import { Pencil } from "@styled-icons/boxicons-solid";
import styled from "styled-components/macro";

const StatusBase = styled.div`
    gap: 4px;
    padding: 4px;
    display: flex;
    align-items: center;
    text-transform: capitalize;
`;

export type EditStatus = "saved" | "editing" | "saving";
interface Props {
    status: EditStatus;
}

export default function SaveStatus({ status }: Props) {
    return (
        <StatusBase>
            {status === "saved" ? (
                <Check size={20} />
            ) : status === "editing" ? (
                <Pencil size={20} />
            ) : (
                <CloudUpload size={20} />
            )}
            {/* FIXME: add i18n */}
            <span>{status}</span>
        </StatusBase>
    );
}
