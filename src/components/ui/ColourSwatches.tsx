import { Check } from "@styled-icons/boxicons-regular";
import { Palette } from "@styled-icons/boxicons-solid";
import styled, { css } from "styled-components";

import { RefObject } from "preact";
import { useRef } from "preact/hooks";

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
    /*gap: 8px;*/
    display: flex;

    input {
        width: 0;
        height: 0;
        top: 72px;
        opacity: 0;
        padding: 0;
        border: 0;
        position: relative;
        pointer-events: none;
    }

    .overlay {
        position: relative;
        width: 0;

        div {
            width: 8px;
            height: 68px;
            background: linear-gradient(
                to right,
                var(--primary-background),
                transparent
            );
        }
    }
`;

const Swatch = styled.div<{ type: "small" | "large"; colour: string }>`
    flex-shrink: 0;
    cursor: pointer;
    border-radius: var(--border-radius);
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
    overflow: auto;
    padding-bottom: 4px;

    > div {
        gap: 8px;
        display: flex;
        flex-direction: row;
        padding-inline-start: 8px;
    }
`;

export default function ColourSwatches({ value, onChange }: Props) {
    const ref = useRef<HTMLInputElement>() as RefObject<HTMLInputElement>;

    return (
        <SwatchesBase>
            <input
                type="color"
                value={value}
                ref={ref}
                onChange={(ev) => onChange(ev.currentTarget.value)}
            />
            <Swatch
                colour={value}
                type="large"
                onClick={() => ref.current?.click()}>
                <Palette size={32} />
            </Swatch>

            <div class="overlay">
                <div />
            </div>

            <Rows>
                {presets.map((row, i) => (
                    <div key={i}>
                        {row.map((swatch, i) => (
                            <Swatch
                                colour={swatch}
                                type="small"
                                key={i}
                                onClick={() => onChange(swatch)}>
                                {swatch === value && <Check size={22} />}
                            </Swatch>
                        ))}
                    </div>
                ))}
            </Rows>
        </SwatchesBase>
    );
}
