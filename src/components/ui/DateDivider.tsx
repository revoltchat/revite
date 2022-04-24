import styled, { css } from "styled-components/macro";

import { dayjs } from "../../context/Locale";

const Base = styled.div.attrs({ role: "separator" })<{ unread?: boolean }>`
    height: 0;
    display: flex;
    user-select: none;
    align-items: center;
    margin: 17px 12px 5px;
    border-top: thin solid var(--tertiary-foreground);

    time {
        margin-top: -2px;
        font-size: 0.6875rem;
        line-height: 0.6875rem;
        padding-inline-start: 5px;
        padding-inline-end: 5px;
        color: var(--tertiary-foreground);
        background: var(--primary-background);
    }

    ${(props) =>
        props.unread &&
        css`
            border-top: thin solid var(--accent);
        `}
`;

const Unread = styled.div`
    background: var(--accent);
    color: var(--accent-contrast);
    font-size: 7px;
    padding: 2px 6px;
    font-size: 10px;
    border-radius: 60px;
    font-weight: 600;
    margin-top: -1px;
`;

interface Props {
    date?: Date;
    unread?: boolean;
}

export default function DateDivider({ unread, date }: Props) {
    return (
        <Base unread={unread}>
            {unread && <Unread>NEW</Unread>}
            {date && <time>{dayjs(date).format("LL")}</time>}
        </Base>
    );
}
