import { Check, Square, X } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components";

type State = "Allow" | "Neutral" | "Deny";

const SwitchContainer = styled.div.attrs({
    role: "radiogroup",
    "aria-orientiation": "horizontal",
})`
    flex-shrink: 0;

    display: flex;
    margin: 4px 16px;
    overflow: hidden;
    border-radius: var(--border-radius);
    background: var(--secondary-background);
    border: 2px solid var(--tertiary-background);
`;

const Switch = styled.div.attrs({
    role: "radio",
})<{ state: State; selected: boolean }>`
    padding: 4px;
    cursor: pointer;
    transition: 0.2s ease all;

    color: ${(props) =>
        props.state === "Allow"
            ? "var(--success)"
            : props.state === "Deny"
            ? "var(--error)"
            : "var(--tertiary-foreground)"};

    ${(props) =>
        props.selected &&
        css`
            color: white;

            background: ${props.state === "Allow"
                ? "var(--success)"
                : props.state === "Deny"
                ? "var(--error)"
                : "var(--primary-background)"};
        `}

    &:hover {
        filter: brightness(0.8);
    }
`;

interface Props {
    state: State;
    onChange: (state: State) => void;
}

export function OverrideSwitch({ state, onChange }: Props) {
    return (
        <SwitchContainer>
            <Switch
                onClick={() => onChange("Deny")}
                state="Deny"
                selected={state === "Deny"}>
                <X size={24} />
            </Switch>
            <Switch
                onClick={() => onChange("Neutral")}
                state="Neutral"
                selected={state === "Neutral"}>
                <Square size={24} />
            </Switch>
            <Switch
                onClick={() => onChange("Allow")}
                state="Allow"
                selected={state === "Allow"}>
                <Check size={24} />
            </Switch>
        </SwitchContainer>
    );
}
