import styled, { css } from "styled-components";
import { Children } from "../../types/Preact";
import { Plus } from "@styled-icons/feather";

const CategoryBase = styled.div<Pick<Props, 'variant'>>`
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;

    margin-top: 4px;
    padding: 6px 10px;
    margin-bottom: 4px;
    white-space: nowrap;
    
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;

    svg {
        stroke: var(--foreground);
        cursor: pointer;
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
