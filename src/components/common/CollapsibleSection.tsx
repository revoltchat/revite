import { ChevronDown } from "@styled-icons/boxicons-regular";

import { Details } from "@revoltchat/ui";

import { useApplicationState } from "../../mobx/State";

interface Props {
    id: string;
    defaultValue: boolean;

    sticky?: boolean;
    large?: boolean;

    summary: Children;
    children: Children;
}

export default function CollapsibleSection({
    id,
    defaultValue,
    summary,
    children,
    ...detailsProps
}: Props) {
    const layout = useApplicationState().layout;

    return (
        <Details
            open={layout.getSectionState(id, defaultValue)}
            onToggle={(e) =>
                layout.setSectionState(id, e.currentTarget.open, defaultValue)
            }
            {...detailsProps}>
            <summary>
                <div className="padding">
                    <ChevronDown size={20} />
                    {summary}
                </div>
            </summary>
            {children}
        </Details>
    );
}
