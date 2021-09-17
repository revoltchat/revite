import styled from "styled-components";

import { ChevronDown } from "@styled-icons/boxicons-regular";

import { State, store } from "../../redux";
import { Action } from "../../redux/reducers";
import { Children } from "../../types/Preact";
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
    const state: State = store.getState();

    function setState(state: boolean) {
        if (state === defaultValue) {
            store.dispatch({
                type: "SECTION_TOGGLE_UNSET",
                id,
            } as Action);
        } else {
            store.dispatch({
                type: "SECTION_TOGGLE_SET",
                id,
                state,
            } as Action);
        }
    }

    return (
        <Wrapper noSpacing={noSpacing}>
            <Details
                open={state.sectionToggle[id] ?? defaultValue}
                onToggle={(e) => setState(e.currentTarget.open)}
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
