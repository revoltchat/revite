import { ChevronRight } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components";

import { Children } from "../../../types/Preact";

const CategoryBase = styled.div`
    height: 54px;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 10px;

    background: var(--secondary-header);

    gap: 12px;
    display: flex;
    align-items: center;
    flex-direction: row;

    .content {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        font-weight: 600;
        font-size: 14px;

        .description {
            font-size: 11px;
            font-weight: 400;

            a:hover {
                text-decoration: underline;
            }
        }
    }

    ${(props) =>
        typeof props.onClick !== "undefined" &&
        css`
            transition: 0.1s ease background-color;

            &:hover {
                background: var(--tertiary-background);
            }

            a {
                cursor: pointer;
            }
        `}
`;

interface Props {
    icon?: Children;
    children?: Children;
    description?: Children;

    onClick?: () => void;
    action?: "chevron" | Children;
}

export default function CategoryButton({
    icon,
    children,
    description,
    onClick,
    action,
}: Props) {
    return (
        <CategoryBase onClick={onClick}>
            {icon}
            <div class="content">
                {children}
                <div className="description">{description}</div>
            </div>
            <div class="action">
                {typeof action === "string" ? (
                    <ChevronRight size={24} />
                ) : (
                    action
                )}
            </div>
        </CategoryBase>
    );
}
