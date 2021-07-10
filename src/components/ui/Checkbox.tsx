import { Check } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components";

import { Children } from "../../types/Preact";

const CheckboxBase = styled.label`
    gap: 4px;
    z-index: 1;
    display: flex;
    margin-top: 20px;
    align-items: center;
    border-radius: var(--border-radius);

    cursor: pointer;
    font-size: 18px;
    user-select: none;

    transition: 0.2s ease all;

    input {
        display: none;
    }

    &:hover {
        .check {
            background: var(--background);
        }
    }

    &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
            background: unset;
        }
    }
`;

const CheckboxContent = styled.span`
    display: flex;
    flex-grow: 1;
    font-size: 1rem;
    font-weight: 600;
    flex-direction: column;
`;

const CheckboxDescription = styled.span`
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--secondary-foreground);
`;

const Checkmark = styled.div<{ checked: boolean }>`
    margin: 4px;
    width: 24px;
    height: 24px;
    display: grid;
    flex-shrink: 0;
    place-items: center;
    transition: 0.2s ease all;
    border-radius: var(--border-radius);
    background: var(--secondary-background);

    svg {
        color: var(--secondary-background);
    }

    ${(props) =>
        props.checked &&
        css`
            background: var(--accent) !important;
        `}
`;

export interface CheckboxProps {
    checked: boolean;
    disabled?: boolean;
    className?: string;
    children: Children;
    description?: Children;
    onChange: (state: boolean) => void;
}

export default function Checkbox(props: CheckboxProps) {
    return (
        <CheckboxBase disabled={props.disabled} className={props.className}>
            <CheckboxContent>
                <span>{props.children}</span>
                {props.description && (
                    <CheckboxDescription>
                        {props.description}
                    </CheckboxDescription>
                )}
            </CheckboxContent>
            <input
                type="checkbox"
                checked={props.checked}
                onChange={() =>
                    !props.disabled && props.onChange(!props.checked)
                }
            />
            <Checkmark checked={props.checked} className="check">
                <Check size={20} />
            </Checkmark>
        </CheckboxBase>
    );
}
