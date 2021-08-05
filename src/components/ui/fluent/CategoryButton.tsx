import { ChevronRight, LinkExternal } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components";

import { Children } from "../../../types/Preact";

interface BaseProps {
    readonly hover?: boolean;
    readonly account?: boolean;
    readonly disabled?: boolean;
    readonly largeDescription?: boolean;
}

const CategoryBase = styled.div<BaseProps>`
    /*height: 54px;*/
    padding: 9.8px 12px;
    border-radius: 6px;
    margin-bottom: 10px;
    color: var(--foreground);
    background: var(--secondary-header);
    gap: 12px;
    display: flex;
    align-items: center;
    flex-direction: row;

    > svg {
        flex-shrink: 0;
    }

    .content {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        font-weight: 600;
        font-size: 14px;

        .title {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
        }

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
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;

            a:hover {
                text-decoration: underline;
            }
        }
    }

    ${(props) =>
        props.hover &&
        css`
            cursor: pointer;
            opacity: 1;
            transition: 0.1s ease background-color;

            &:hover {
                background: var(--secondary-background);
            }
        `}

    ${(props) =>
        props.disabled &&
        css`
            opacity: 0.4;
            /*.content,
            .action {
                color: var(--tertiary-foreground);
            }*/

            .action {
                font-size: 14px;
            }
        `}
    
    ${(props) =>
        props.account &&
        css`
            height: 54px;

            .content {
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                .title {
                    text-transform: uppercase;
                    font-size: 12px;
                    color: var(--secondary-foreground);
                }

                .description {
                    font-size: 15px;

                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                }
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
    account,
    disabled,
    onClick,
    hover,
    action,
}: Props) {
    return (
        <CategoryBase
            hover={hover || typeof onClick !== "undefined"}
            onClick={onClick}
            disabled={disabled}
            account={account}>
            {icon}
            <div class="content">
                <div className="title">{children}</div>

                <div className="description">{description}</div>
            </div>
            <div class="action">
                {typeof action === "string" ? (
                    action === "chevron" ? (
                        <ChevronRight size={24} />
                    ) : (
                        <LinkExternal size={20} />
                    )
                ) : (
                    action
                )}
            </div>
        </CategoryBase>
    );
}
