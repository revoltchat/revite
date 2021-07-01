import styled, { css } from "styled-components";
import { Children } from "../../types/Preact";
import { Plus } from "@styled-icons/boxicons-regular";

const CategoryBase = styled.div<Pick<Props, 'variant'>>`
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;

    margin-top: 4px;
    padding: 6px 0;
    margin-bottom: 4px;
    white-space: nowrap;
    
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;

    svg {
        cursor: pointer;
    }

    &:first-child {
        margin-top: 0;
        padding-top: 0;
    }

    ${ props => props.variant === 'uniform' && css`
        padding-top: 6px;
    ` }
`;

interface Props {
    text: Children;
    action?: () => void;
    variant?: 'default' | 'uniform';
}

export default function Category(props: Props) {
    return (
        <CategoryBase>
            {props.text}
            {props.action && (
                <Plus size={16} onClick={props.action} />
            )}
        </CategoryBase>
    );
};
