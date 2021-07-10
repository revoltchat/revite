import { Circle } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components";

import { Children } from "../../types/Preact";

interface Props {
    children: Children;
    description?: Children;

    checked: boolean;
    disabled?: boolean;
    onSelect: () => void;
}

interface BaseProps {
    selected: boolean;
}

const RadioBase = styled.label<BaseProps>`
    gap: 4px;
    z-index: 1;
    padding: 4px;
    display: flex;
    cursor: pointer;
    align-items: center;

    font-size: 1rem;
    font-weight: 600;
    user-select: none;
    transition: 0.2s ease all;
    border-radius: var(--border-radius);

    &:hover {
        background: var(--hover);
    }

    > input {
        display: none;
    }

    > div {
        margin: 4px;
        width: 24px;
        height: 24px;
        display: grid;
        border-radius: 50%;
        place-items: center;
        background: var(--foreground);

        svg {
            color: var(--foreground);
            /*stroke-width: 2;*/
        }
    }

    ${(props) =>
        props.selected &&
        css`
            color: white;
            cursor: default;
            background: var(--accent);

            > div {
                background: white;
            }

            > div svg {
                color: var(--accent);
            }

            &:hover {
                background: var(--accent);
            }
        `}
`;

const RadioDescription = styled.span<BaseProps>`
    font-size: 0.8em;
    font-weight: 400;
    color: var(--secondary-foreground);

    ${(props) =>
        props.selected &&
        css`
            color: white;
        `}
`;

export default function Radio(props: Props) {
    return (
        <RadioBase
            selected={props.checked}
            disabled={props.disabled}
            onClick={() =>
                !props.disabled && props.onSelect && props.onSelect()
            }>
            <div>
                <Circle size={12} />
            </div>
            <input type="radio" checked={props.checked} />
            <span>
                <span>{props.children}</span>
                {props.description && (
                    <RadioDescription selected={props.checked}>
                        {props.description}
                    </RadioDescription>
                )}
            </span>
        </RadioBase>
    );
}
