import styled from "styled-components";

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
`;

interface Props {
    icon?: Children;
    children?: Children;
}

export default function CategoryButton({ icon, children }: Props) {
    return <CategoryBase>{icon}</CategoryBase>;
}
