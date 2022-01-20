import styled from "styled-components";

import { ChevronDown } from "@styled-icons/boxicons-regular";

import { Children } from "../../types/Preact";

import { useApplicationState } from "../../mobx/State";

import Details from "../ui/Details";

const Wrapper = styled.div<{ noSpacing?: boolean }>`
    margin: ${(p) => (p.noSpacing ? "0" : "24px")} 0;
`;

interface Props {
    id: string;
    defaultValue: boolean;

    sticky?: boolean;
    large?: boolean;
    noSpacing?: boolean;

    summary: Children;
    children: Children;
}

export default function CollapsibleSection({
    id,
    defaultValue,
    summary,
    children,
    noSpacing,
    ...detailsProps
}: Props) {
    const layout = useApplicationState().layout;

    return (
        <Wrapper noSpacing={noSpacing}>
            <Details
                open={layout.getSectionState(id, defaultValue)}
                onToggle={(e) =>
                    layout.setSectionState(id, e.currentTarget.open, defaultValue)
                }
                {...detailsProps}>
                <summary>
                    <div class="padding">
                        <ChevronDown size={20} />
                        {summary}
                    </div>
                </summary>
                {children}
            </Details>
        </Wrapper>
    );
}
