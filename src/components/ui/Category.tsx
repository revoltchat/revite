import { Plus } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components/macro";

import { Children } from "../../types/Preact";

const CategoryBase = styled.div<Pick<Props, "variant">>`
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;

    margin-top: 4px;
    padding: 6px 0 6px 8px;
    margin-bottom: 4px;
    white-space: nowrap;

    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;

    > button {
        background: 0;
        border: 0;
        color: inherit;
    }

    svg {
        cursor: pointer;
    }

    &:first-child {
        margin-top: 0;
        padding-top: 0;
    }

    ${(props) =>
        props.variant === "uniform" &&
        css`
            padding-top: 6px;
        `}
`;

type Props = Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "children" | "as" | "action"
> & {
    text: Children;
    action?: () => void;
    variant?: "default" | "uniform";
};

export default function Category(props: Props) {
    const { text, action, ...otherProps } = props;

    return (
        <CategoryBase {...otherProps}>
            {text}
            {action && (
                <button onClick={action}>
                    <Plus size={16} />
                </button>
            )}
        </CategoryBase>
    );
}
