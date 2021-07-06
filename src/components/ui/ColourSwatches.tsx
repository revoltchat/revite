import { Check } from "@styled-icons/boxicons-regular";
import { Palette } from "@styled-icons/boxicons-solid";
import styled, { css } from "styled-components";

import { useRef } from "preact/hooks";
import { RefObject } from "preact";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const presets = [
    [
        "#7B68EE",
        "#3498DB",
        "#1ABC9C",
        "#F1C40F",
        "#FF7F50",
        "#FD6671",
        "#E91E63",
        "#D468EE",
    ],
    [
        "#594CAD",
        "#206694",
        "#11806A",
        "#C27C0E",
        "#CD5B45",
        "#FF424F",
        "#AD1457",
        "#954AA8",
    ],
];

const SwatchesBase = styled.div`
    gap: 8px;
    display: flex;

    input {
        opacity: 0;
        margin-top: 44px;
        position: absolute;
        pointer-events: none;
    }
`;

const Swatch = styled.div<{ type: "small" | "large"; colour: string }>`
    flex-shrink: 0;
    cursor: pointer;
    border-radius: 4px;
    background-color: ${(props) => props.colour};

    display: grid;
    place-items: center;

    &:hover {
        border: 3px solid var(--foreground);
        transition: border ease-in-out 0.07s;
    }

    svg {
        color: white;
    }

    ${(props) =>
        props.type === "small"
            ? css`
                  width: 30px;
                  height: 30px;

                  svg {
                      /*stroke-width: 2;*/
                  }
              `
            : css`
                  width: 68px;
                  height: 68px;
              `}
`;

const Rows = styled.div`
    gap: 8px;
    display: flex;
    flex-direction: column;

    > div {
        gap: 8px;
        display: flex;
        flex-direction: row;
    }
`;

export default function ColourSwatches({ value, onChange }: Props) {
    const ref = useRef<HTMLInputElement>() as RefObject<HTMLInputElement>;

    return (
        <SwatchesBase>
            <Swatch
                colour={value}
                type="large"
                onClick={() => ref.current?.click()}>
                <Palette size={32} />
            </Swatch>
            <input
                type="color"
                value={value}
                ref={ref}
                onChange={(ev) => onChange(ev.currentTarget.value)}
            />
            <Rows>
                {presets.map((row, i) => (
                    <div key={i}>
                        {row.map((swatch, i) => (
                            <Swatch
                                colour={swatch}
                                type="small"
                                key={i}
                                onClick={() => onChange(swatch)}>
                                {swatch === value && <Check size={18} />}
                            </Swatch>
                        ))}
                    </div>
                ))}
            </Rows>
        </SwatchesBase>
    );
}
