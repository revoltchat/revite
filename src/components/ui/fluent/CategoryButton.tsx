import { ChevronRight, LinkExternal } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components";

import { Children } from "../../../types/Preact";

interface BaseProps {
    readonly disabled?: boolean;
    readonly largeDescription?: boolean;
}

const CategoryBase = styled.div<BaseProps>`
    height: 54px;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 10px;

    color: var(--foreground);
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
            ${(props) =>
                props.largeDescription
                    ? css`
                          font-size: 14px;
                      `
                    : css`
                          font-size: 11px;
                      `}

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

    ${(props) =>
        props.disabled &&
        css`
            .content,
            .action {
                color: var(--tertiary-foreground);
            }
        `}
`;

interface Props extends BaseProps {
    icon?: Children;
    children?: Children;
    description?: Children;

    onClick?: () => void;
    action?: "chevron" | "external" | Children;
}

export default function CategoryButton({
    icon,
    children,
    description,
    largeDescription,
    disabled,
    onClick,
    action,
}: Props) {
    return (
        <CategoryBase
            onClick={onClick}
            disabled={disabled}
            largeDescription={largeDescription}>
            {icon}
            <div class="content">
                {children}
                <div className="description">{description}</div>
            </div>
            <div class="action">
                {typeof action === "string" ? (
                    action === "chevron" ? (
                        <ChevronRight size={24} />
                    ) : (
                        <LinkExternal size={24} />
                    )
                ) : (
                    action
                )}
            </div>
        </CategoryBase>
    );
}
