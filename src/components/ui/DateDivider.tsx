import styled, { css } from "styled-components";

import { dayjs } from "../../context/Locale";

const Base = styled.div<{ unread?: boolean }>`
    height: 0;
    display: flex;
    user-select: none;
    align-items: center;
    margin: 17px 12px 5px;
    border-top: thin solid var(--tertiary-foreground);

    time {
        margin-top: -2px;
        font-size: .6875rem;
        line-height: .6875rem;
        padding: 2px 0 2px 0;
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
    color: white;
    padding: 5px 8px;
    border-radius: 60px;
    font-weight: 600;
`;

interface Props {
    date: Date;
    unread?: boolean;
}

export default function DateDivider(props: Props) {
    return (
        <Base unread={props.unread}>
            {props.unread && <Unread>NEW</Unread>}
            <time>{dayjs(props.date).format("LL")}</time>
        </Base>
    );
}
