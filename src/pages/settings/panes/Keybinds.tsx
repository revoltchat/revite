import {
    LeftArrowAlt,
    DownArrowAlt,
    RightArrowAlt,
    UpArrowAlt,
    Reset,
} from "@styled-icons/boxicons-regular";
import {
    XCircle,
    Edit,
    PlusCircle,
    Pencil,
} from "@styled-icons/boxicons-solid";
import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import styles from "./Panes.module.scss";
import { JSX } from "preact";
import { Text } from "preact-i18n";

import { useApplicationState } from "../../../mobx/State";
import KeybindsType, {
    KeybindAction,
    Keybinding,
    KeybindSequence,
    KeyCombo,
} from "../../../mobx/stores/Keybinds";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import CollapsibleSection from "../../../components/common/CollapsibleSection";
import Categories from "../../../components/ui/Category";
import IconButton from "../../../components/ui/IconButton";
import CategoryButton, {
    CategoryBase,
} from "../../../components/ui/fluent/CategoryButton";

const KeySequence = styled.kbd`
    display: inline-flex;
    place-items: center;
    font-size: 1rem;
    gap: 1ch;
    line-height: 1;
    flex-wrap: wrap;

    // todo: clean this up
    & > kbd {
        display: inline-flex;
        gap: 0.5ch;
    }
    & > kbd > kbd {
        display: inline-flex;
        background-color: var(--tertiary-background);

        padding: 0.5ch 1ch 0.35ch;
        border-radius: 3px;

        outline: 1px solid rgb(66 66 66 / 0.5);
        box-shadow: 0 1px 1px rgba(133, 133, 133, 0.2),
            0 2.5px 0 0 rgba(0, 0, 0, 0.5);

        font-size: 0.85em;
        font-weight: 700;

        text-transform: uppercase;

        &:active {
            outline: 1px solid rgb(0 0 0 / 0.3);
            color: var(--tertiary-foreground);
            transform: translateY(2px);
            box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }
    }

    svg {
        // change arrow scaling in svgs to better fit the text
        transform: scale(1.5);
    }
`;

const REPLACEMENTS: Record<string, () => JSX.Element> = {
    ArrowUp: () => <UpArrowAlt size="1em" />,
    ArrowDown: () => <DownArrowAlt size="1em" />,
    ArrowLeft: () => <LeftArrowAlt size="1em" />,
    ArrowRight: () => <RightArrowAlt size="1em" />,
};

// todo: make this look cleaner
const Key = ({ value: key }: { value: string }) => (
    <kbd>{REPLACEMENTS[key]?.() ?? key}</kbd>
);

type KeybindProps = {
    sequence: string | KeyCombo[];
};
export const Keybind = ({ sequence }: KeybindProps) => {
    const keys = (
        typeof sequence === "string"
            ? KeybindSequence.parse(sequence)
            : sequence
    ).map((keybinding) => (
        <kbd>
            {KeyCombo.stringifyShort(keybinding).map((mod, i) => [
                i > 0 ? "+" : null,
                <Key value={mod} />,
            ])}
        </kbd>
    ));

    return <KeySequence>{keys}</KeySequence>;
};

// todo: use `main` in the future for better accessability
const Container = styled.div`
    // hack: increase specificity because Panes.module.css usually has higher.
    &&& {
        h1,
        h2,
        h3,
        h4,
        h5 {
            text-transform: uppercase;
            margin: 0;
        }

        header {
            display: flex;
            place-items: center;

            label {
                margin: 0;
            }
        }

        .subsection {
            display: flex;
            flex-direction: column;
            gap: 1ch;

            hr {
                margin: 0;
            }
        }

        .action {
            display: grid;
            grid-template-columns: 1fr;
            align-items: center;
            // gap: 1ch 0.5ch;

            .keybind {
                display: flex;
                place-items: center;
                gap: 1ch;

                padding: 9.8px 12px;

                > kbd {
                    flex: 1;
                }
            }

            .unset-keybind {
            }
        }
    }
`;

type Actions = Record<string, KeybindAction>;
type Categories = Record<string, Actions>;

type ActionProps = {
    id: string;
    action: KeybindAction;
    keybinds: KeybindsType;
};

const ActionGroup = observer(({ id, action, keybinds }: ActionProps) => {
    const { openScreen } = useIntermediate();

    // todo: add category button sections support for each keybinding, similar to https://autumn.revolt.chat/attachments/6adrbbW9VwkLnnkL76MTX_nDrbp5LwVRKHBeVEN3-D is sectioned
    return (
        <article class="action">
            <CategoryButton
                onClick={() =>
                    openScreen({
                        id: "keybind_capture",
                        actionName: id,
                        onSubmit: (seq) =>
                            keybinds.addKeybind(
                                action,
                                KeybindSequence.stringify(seq),
                            ),
                    })
                }
                action={<PlusCircle size={20} />}
                description="navigate between channels in the current server">
                {/* todo: localize */}
                {id.toUpperCase()}
            </CategoryButton>
            {keybinds.getKeybinds(action).map((keybind, i) => {
                const defaultSequence = keybinds.getDefault(action, i);
                return (
                    <div class="keybind">
                        <Keybind sequence={keybind.sequence} />
                        {/* TODO: tooltip this */}
                        <IconButton
                            onClick={() =>
                                openScreen({
                                    id: "keybind_capture",
                                    actionName: id,
                                    onSubmit: (seq) =>
                                        keybinds.setKeybind(
                                            action,
                                            i,
                                            KeybindSequence.stringify(seq),
                                        ),
                                })
                            }>
                            <Pencil size={20} />
                        </IconButton>
                        {!isEqual(
                            keybind.sequence,
                            defaultSequence?.sequence,
                        ) && (
                            <IconButton
                                onClick={() =>
                                    keybinds.resetToDefault(action, i)
                                }>
                                {/* TODO: tooltip these */}
                                {defaultSequence ? (
                                    <Reset
                                        size={20}
                                        title={`Reset to ${KeybindSequence.stringifyShort(
                                            defaultSequence.sequence,
                                        )}`}
                                    />
                                ) : (
                                    <XCircle size={20} title="Remove" />
                                )}
                            </IconButton>
                        )}
                    </div>
                );
            })}
        </article>
    );
});

type SectionProps = {
    id: string;
    actions: Actions;
    keybinds: KeybindsType;
};

const KeybindSection = observer(({ id, actions, keybinds }: SectionProps) => (
    <section class="subsection">
        {Array.from(Object.keys(actions), (actionName, i) => (
            <>
                {/* Technically `hr` shouldn't be used because of it's semantic meaning, but the rest of the app uses it so for consistency it's being used it here. */}
                {i > 0 && <hr />}
                <ActionGroup
                    id={actionName}
                    action={actions[actionName]}
                    keybinds={keybinds}
                />
            </>
        ))}
    </section>
));

type GenericKeybindsProps = {
    categories: Categories;
    keybinds: KeybindsType;
};

export const GenericKeybinds = observer(
    ({ categories, keybinds }: GenericKeybindsProps) => (
        <>
            {Array.from(Object.keys(categories), (categoryId) => {
                const actions = categories[categoryId];
                return (
                    <CollapsibleSection
                        id={`keybinds_${categoryId}`}
                        defaultValue
                        summary={<Categories text={categoryId} />}>
                        <KeybindSection
                            id={categoryId}
                            actions={actions}
                            keybinds={keybinds}
                        />
                    </CollapsibleSection>
                );
            })}
        </>
    ),
);

export const Keybinds = observer(() => {
    const keybinds = useApplicationState().keybinds;
    return (
        <Container>
            <GenericKeybinds
                keybinds={keybinds}
                categories={{
                    navigation: {
                        navigate_channels_up: KeybindAction.NavigateChannelUp,
                        navigate_channels_down:
                            KeybindAction.NavigateChannelDown,
                        navigate_servers_up: KeybindAction.NavigateServerUp,
                        navigate_servers_down: KeybindAction.NavigateServerDown,

                        // todo: localize as "Go back" or "Cancel"?
                        // probably won't be displayed unless under an advanced section.
                        navigate_previous_context:
                            KeybindAction.NavigatePreviousContext,
                    },
                    messaging: {
                        edit_previous_message:
                            KeybindAction.EditPreviousMessage,
                    },
                }}
            />
        </Container>
    );
});
