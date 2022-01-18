import {
    LeftArrowAlt,
    DownArrowAlt,
    RightArrowAlt,
    UpArrowAlt,
    Reset,
} from "@styled-icons/boxicons-regular";
import { XCircle, PlusCircle, Pencil } from "@styled-icons/boxicons-solid";
import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import styled, { css } from "styled-components";

import { JSX } from "preact";
import { Text, useText } from "preact-i18n";
import { useMemo, useState } from "preact/hooks";

import { TextReact } from "../../../lib/i18n";

import { useApplicationState } from "../../../mobx/State";
import KeybindsType, {
    KeybindAction,
    KeybindSequence,
    KeyCombo,
    keyFull,
    keyShort,
} from "../../../mobx/stores/Keybinds";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import CollapsibleSection from "../../../components/common/CollapsibleSection";
import Tooltip from "../../../components/common/Tooltip";
import Category from "../../../components/ui/Category";
import IconButton from "../../../components/ui/IconButton";
import InputBox from "../../../components/ui/InputBox";
import CategoryButton from "../../../components/ui/fluent/CategoryButton";

const REPLACEMENTS: Record<string, () => JSX.Element> = {
    ArrowUp: () => <UpArrowAlt size="1em" />,
    ArrowDown: () => <DownArrowAlt size="1em" />,
    ArrowLeft: () => <LeftArrowAlt size="1em" />,
    ArrowRight: () => <RightArrowAlt size="1em" />,
};

// todo: move `Key` and `Keybind` to components
// todo: change `simple` to something more descriptive like `pressable` or `indented`?
type KeyProps = {
    children: string;
    short?: boolean;
    simple?: boolean;
};
const Key = styled.kbd.attrs<KeyProps, { light: boolean }>(
    ({ children: key, short = true, simple = false }) => {
        return {
            simple,
            children:
                REPLACEMENTS[key]?.() ?? (short ? keyShort(key) : keyFull(key)),
            light: useApplicationState().settings.theme.isLight(),
        };
    },
)<KeyProps>`
    display: inline-flex;
    background-color: ${(props) =>
        props.light
            ? "rgb(var(--tertiary-background-rgb), 0.05)"
            : "var(--tertiary-background)"};

    padding: 0.5ch 1ch 0.35ch;

    border-radius: 3px;
    outline: 1px solid rgb(66 66 66 / 0.5);

    font-weight: 700;
    font-family: var(--monospace-font), monospace;

    text-transform: uppercase;

    svg {
        // change arrow scaling in svgs to better fit the text
        transform: scale(1.5);
    }

    ${(props) =>
        !props.simple &&
        css`
            box-shadow: 0 1px 1px rgba(133, 133, 133, 0.2),
                0 2.5px 0 0 rgba(0, 0, 0, 0.5);

            &:active {
                outline: 1px solid rgb(0 0 0 / 0.3);
                color: var(--tertiary-foreground);
                transform: translateY(2px);
                box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
            }
        `}
`;

const KeySequence = styled.kbd`
    display: inline-flex;
    place-items: center;
    flex-wrap: wrap;
    gap: 1ch;

    line-height: 1;
    font-size: 0.85em;
    font-family: var(--monospace-font), monospace;

    // todo: clean this up
    & > kbd {
        display: inline-flex;
        align-items: center;
        gap: 0.5ch;
    }
`;

// allow string to make easier to use
type KeybindProps = {
    children: string | KeyCombo[];
    short?: boolean;
    simple?: boolean;
};
export const Keybind = ({
    children: sequence,
    short,
    simple,
}: KeybindProps) => {
    const keys =
        typeof sequence === "string"
            ? KeybindSequence.parse(sequence)
            : sequence;

    const kbds = keys.map((keybinding) => (
        <kbd>
            {keybinding.map((mod, i) => [
                i > 0 ? "+" : null,
                <Key
                    children={mod}
                    short={short ?? keys.flat().length > 1}
                    simple={simple}
                />,
            ])}
        </kbd>
    ));

    return <KeySequence>{kbds}</KeySequence>;
};

// todo: use `main` in the future for better accessability
const Container = styled.div`
    // hack: increase specificity because Panes.module.css usually has higher.
    &&& {
        display: flex;
        flex-direction: column;

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
        }
    }
`;

type KeybindEntriesProps = { action: KeybindAction };
const KeybindEntries = observer(({ action }: KeybindEntriesProps) => {
    const keybinds = useApplicationState().keybinds;
    const { openScreen } = useIntermediate();

    const entries = keybinds.getKeybinds(action).map((keybind, i) => {
        const defaultSequence = keybinds.getDefault(action, i)?.sequence;
        const isDefault = isEqual(keybind.sequence, defaultSequence);

        return (
            <div class="keybind">
                <Keybind>{keybind.sequence}</Keybind>
                <Tooltip
                    content={
                        <Text id="app.settings.pages.keybinds.edit_keybind" />
                    }>
                    <IconButton
                        onClick={() =>
                            openScreen({
                                id: "keybind_capture",
                                actionName: action,
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
                </Tooltip>

                {!isDefault && (
                    <IconButton
                        onClick={() => keybinds.resetToDefault(action, i)}>
                        {defaultSequence ? (
                            <Tooltip
                                content={
                                    <TextReact
                                        id="app.settings.pages.keybinds.reset_keybind"
                                        fields={{
                                            keybind: (
                                                <Keybind simple>
                                                    {defaultSequence}
                                                </Keybind>
                                            ),
                                        }}
                                    />
                                }>
                                <Reset size={20} />
                            </Tooltip>
                        ) : (
                            <Tooltip
                                content={
                                    <Text id="app.settings.pages.keybinds.remove_keybind" />
                                }>
                                <XCircle size={20} />
                            </Tooltip>
                        )}
                    </IconButton>
                )}
            </div>
        );
    });

    return <>{entries}</>;
});

type ActionProps = {
    action: KeybindAction;
    keybinds: KeybindsType;
};

const ActionGroup = observer(({ action, keybinds }: ActionProps) => {
    const { openScreen } = useIntermediate();

    // todo: add category button sections support for each keybinding, similar to https://autumn.revolt.chat/attachments/6adrbbW9VwkLnnkL76MTX_nDrbp5LwVRKHBeVEN3-D is sectioned
    return (
        <article class="action">
            <CategoryButton
                onClick={() =>
                    openScreen({
                        id: "keybind_capture",
                        actionName: action,
                        onSubmit: (seq) =>
                            keybinds.addKeybind(
                                action,
                                KeybindSequence.stringify(seq),
                            ),
                    })
                }
                action={
                    <Tooltip
                        content={
                            <Text id="app.settings.pages.keybinds.add_keybind" />
                        }>
                        <PlusCircle size={20} />
                    </Tooltip>
                }
                description={
                    <Text
                        id={`app.settings.pages.keybinds.action.${action}.description`}
                    />
                }>
                <Text
                    id={`app.settings.pages.keybinds.action.${action}.title`}
                />
            </CategoryButton>
            <KeybindEntries action={action} />
        </article>
    );
});

type SectionProps = {
    id: string;
    actions: KeybindAction[];
    keybinds: KeybindsType;
};

const KeybindSection = observer(({ id, actions, keybinds }: SectionProps) => (
    <section class="subsection">
        {actions.map((action, i) => (
            <>
                {/* Technically `hr` shouldn't be used because of it's semantic meaning, but the rest of the app uses it so for consistency it's being used it here. */}
                {i > 0 && <hr />}
                <ActionGroup action={action} keybinds={keybinds} />
            </>
        ))}
    </section>
));

type GenericKeybindsProps = {
    categories: Record<string, KeybindAction[]>;
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
                        defaultValue={categoryId !== "advanced"}
                        summary={<Category text={categoryId} />}>
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

    const categories = {
        navigation: [
            KeybindAction.NavigateChannelUp,
            KeybindAction.NavigateChannelDown,
            KeybindAction.NavigateServerUp,
            KeybindAction.NavigateServerDown,
        ],
        messaging: [KeybindAction.MessagingEditPreviousMessage],
        // todo: advanced subsections?
        advanced: [
            // autocomplete
            KeybindAction.AutoCompleteSelect,
            KeybindAction.AutoCompleteUp,
            KeybindAction.AutoCompleteDown,

            // input / form
            KeybindAction.InputSubmit,
            KeybindAction.InputCancel,
            KeybindAction.InputForceSubmit,

            // messaging / channel
            KeybindAction.MessagingScrollToBottom,
            KeybindAction.MessagingMarkChannelRead,

            // todo: localize as "Go back" or "Cancel"?
            // probably won't be displayed unless under an advanced section.
            KeybindAction.NavigatePreviousContext,
        ],
    };

    const [value, setValue] = useState("");

    // todo: cache and use existing data
    const searchData: [KeybindAction, ...string[]][] = useMemo(
        () =>
            Object.values(categories)
                .flat()
                .map((action) => {
                    return [
                        action,
                        useText(
                            `app.settings.pages.keybinds.action.${action}.description`,
                        ).description,
                        useText(
                            `app.settings.pages.keybinds.action.${action}.title`,
                        ).title,
                        ...keybinds
                            .getKeybinds(action)
                            .flatMap((keybind) => [
                                KeybindSequence.stringifyFull(keybind.sequence),
                                KeybindSequence.stringifyShort(
                                    keybind.sequence,
                                ),
                            ]),
                    ];
                }),
        [keybinds],
    );

    const filteredCategories = useMemo(() => {
        const foundActions = searchData
            .filter((data) => data.some((text) => text.includes(value)))
            .map((d) => d[0]);

        return Object.fromEntries(
            Object.entries(categories).map(([k, v]) => [
                k,
                v.filter((a) => foundActions.includes(a)),
            ]),
        );
    }, [value]);

    return (
        <Container>
            <InputBox
                placeholder={
                    useText("app.settings.pages.keybinds.search").search
                }
                onInput={(e) => setValue(e.currentTarget.value)}
                contrast></InputBox>
            <GenericKeybinds
                keybinds={keybinds}
                categories={filteredCategories}
            />
        </Container>
    );
});
