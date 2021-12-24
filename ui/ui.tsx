import styled from "styled-components";

import "../src/styles/index.scss";
import { render } from "preact";
import { useState } from "preact/hooks";

import Theme from "../src/context/Theme";

import Banner from "../src/components/ui/Banner";
import Button from "../src/components/ui/Button";
import Checkbox from "../src/components/ui/Checkbox";
import ColourSwatches from "../src/components/ui/ColourSwatches";
import ComboBox from "../src/components/ui/ComboBox";
import InputBox from "../src/components/ui/InputBox";
import Overline from "../src/components/ui/Overline";
import Radio from "../src/components/ui/Radio";
import Tip from "../src/components/ui/Tip";

export const UIDemo = styled.div`
    gap: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export function UI() {
    let [checked, setChecked] = useState(false);
    let [colour, setColour] = useState("#FD6671");
    let [selected, setSelected] = useState<"a" | "b" | "c">("a");

    return (
        <>
            <Button>Button (normal)</Button>
            <Button contrast>Button (contrast)</Button>
            <Button error>Button (error)</Button>
            <Button contrast error>
                Button (contrast + error)
            </Button>
            <Banner>I am a banner!</Banner>
            <Checkbox
                checked={checked}
                onChange={setChecked}
                description="ok gamer">
                Do you want thing??
            </Checkbox>
            <ComboBox>
                <option>Select an option.</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
            </ComboBox>
            <InputBox placeholder="Normal input box..." />
            <InputBox placeholder="Contrast input box..." contrast />
            <InputBox value="Input box with value" />
            <InputBox value="Contrast with value" contrast />
            <ColourSwatches value={colour} onChange={(v) => setColour(v)} />
            <Tip hideSeparator>I am a tip! I provide valuable information.</Tip>
            <Radio checked={selected === "a"} onSelect={() => setSelected("a")}>
                First option
            </Radio>
            <Radio checked={selected === "b"} onSelect={() => setSelected("b")}>
                Second option
            </Radio>
            <Radio checked={selected === "c"} onSelect={() => setSelected("c")}>
                Last option
            </Radio>
            <Overline>Normal overline</Overline>
            <Overline type="subtle">Subtle overline</Overline>
            <Overline type="error">Error overline</Overline>
            <Overline error="with error">Normal overline</Overline>
            <Overline type="subtle" error="with error">
                Subtle overline
            </Overline>
        </>
    );
}

render(
    <>
        <UIDemo>
            <UI />
        </UIDemo>
        <Theme />
    </>,
    document.getElementById("app")!,
);
