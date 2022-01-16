import { Reset } from "@styled-icons/boxicons-regular";
import styled from "styled-components";

import { createRef } from "preact";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import {
    KEYBINDING_MODIFIER_KEYS,
    KeyCombo,
} from "../../../mobx/stores/Keybinds";

import IconButton from "../../../components/ui/IconButton";
import Modal from "../../../components/ui/Modal";

import { Keybind } from "../../../pages/settings/panes/Keybinds";

type Props = {
    actionName: string;
    onClose: () => void;
    onSubmit: (keys: KeyCombo[]) => void;
};

const Container = styled.div`
    display: flex;
    gap: 1ch;
    place-items: center;
`;

// taken from theme tools, it may be a good idea to eventually make a style for "boxes" like this
const InputBox = styled.output`
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    min-width: 0;
    flex-grow: 1;
    padding: 8px;
    font-family: var(--monospace-font);
    border-radius: var(--border-radius);
    background: var(--secondary-background);

    kbd {
        flex-wrap: wrap;
    }
`;

const REPLACEMENTS: Record<string, string> = {
    " ": "Space",
};

// some notes, could be considered bugs
// if a key is held down and not resolved, ex. losing focus then the next key will override it.
// if a combo is pressed like ctrl+a and ctrl is released while holding a for another second, a will be added to the sequence again.

export const InputCaptureModal = ({ onClose, onSubmit, actionName }: Props) => {
    const [sequence, setSequence] = useState<KeyCombo[]>([]);
    const [mods, setMods] = useState<string[]>([]);
    const okButton = createRef<HTMLButtonElement>();
    const input = createRef<HTMLOutputElement>();
    const timer = createRef<NodeJS.Timeout>();

    const submit = () => {
        if (sequence.length > 0) {
            onSubmit(sequence);
        }
        onClose();
    };

    const reset = () => {
        setSequence([]);
        setMods([]);
        input.current?.focus();
    };

    function onKeyDown(event: KeyboardEvent) {
        event.preventDefault();

        if (event.repeat) return;
        timer.current && clearTimeout(timer.current);

        const mods = KEYBINDING_MODIFIER_KEYS.filter((mod) =>
            event.getModifierState(mod),
        );
        if (KEYBINDING_MODIFIER_KEYS.includes(event.key)) {
            setMods(mods);
        } else {
            setMods([]);
            setSequence((seq) => [
                ...seq,
                [...mods, REPLACEMENTS[event.key] ?? event.key],
            ]);
            if (sequence.length >= 1) {
                okButton.current?.focus();
            }
        }
    }

    function onKeyUp(event: KeyboardEvent) {
        event.preventDefault();

        // Allow the user to use keyboard navigation again.
        if (mods.length === 0) {
            timer.current = setTimeout(() => {
                okButton.current?.focus();
            }, 1000);
        }

        if (mods.length > 0 && KEYBINDING_MODIFIER_KEYS.includes(event.key)) {
            setSequence((seq) => [...seq, mods]);
            setMods([]);
            if (sequence.length >= 1) {
                okButton.current?.focus();
            }
        }
    }

    useEffect(() => {
        input.current?.focus();
    }, []);

    return (
        <Modal
            visible={true}
            onClose={onClose}
            title={`Keybinding for ${actionName}`}
            actions={[
                {
                    ref: okButton,
                    onClick: submit,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.ok" />,
                },
                {
                    onClick: onClose,
                    confirmation: false,
                    children: <Text id="app.special.modals.actions.cancel" />,
                },
            ]}>
            <Container>
                <InputBox
                    tabIndex={0}
                    ref={input}
                    onClick={reset}
                    onKeyDownCapture={onKeyDown}
                    onKeyUpCapture={onKeyUp}>
                    {sequence.length + mods.length > 0 ? (
                        <Keybind
                            sequence={sequence.concat(
                                mods.length > 0 ? [mods] : [],
                            )}
                        />
                    ) : (
                        "Press a key"
                    )}
                </InputBox>
                <IconButton title="clear input" onClick={reset}>
                    <Reset size={20} />
                </IconButton>
            </Container>
        </Modal>
    );
};
