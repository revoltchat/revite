import { Pencil } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import styled from "styled-components/macro";

import { InputBox } from "@revoltchat/ui";

import { useDebounceCallback } from "../../../../lib/debounce";

import { useApplicationState } from "../../../../mobx/State";

import { Variables } from "../../../../context/Theme";

const Container = styled.div`
    row-gap: 8px;
    display: grid;
    column-gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    margin-bottom: 20px;

    .entry {
        padding: 12px;
        margin-top: 8px;
        border: 1px solid black;
        border-radius: var(--border-radius);

        span {
            flex: 1;
            display: block;
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 8px;
            text-transform: capitalize;

            background: inherit;
            background-clip: text;
            -webkit-background-clip: text;
        }

        .override {
            gap: 8px;
            display: flex;

            .picker {
                width: 38px;
                height: 38px;
                display: grid;
                cursor: pointer;
                place-items: center;
                border-radius: var(--border-radius);
                background: var(--primary-background);
            }

            input[type="text"] {
                width: 0;
                min-width: 0;
                flex-grow: 1;
            }
        }

        .input {
            width: 0;
            height: 0;
            position: relative;

            input {
                opacity: 0;
                border: none;
                display: block;
                cursor: pointer;
                position: relative;

                top: 48px;
            }
        }
    }
`;

export default observer(() => {
    const theme = useApplicationState().settings.theme;
    const setVariable = useDebounceCallback(
        (data) => {
            const { key, value } = data as { key: Variables; value: string };
            theme.setVariable(key, value);
        },
        [theme],
        100,
    );

    return (
        <Container>
            {(
                [
                    "accent",
                    "background",
                    "foreground",
                    "primary-background",
                    "primary-header",
                    "secondary-background",
                    "secondary-foreground",
                    "secondary-header",
                    "tertiary-background",
                    "tertiary-foreground",
                    "block",
                    "message-box",
                    "mention",
                    "scrollbar-thumb",
                    "scrollbar-track",
                    "status-online",
                    "status-away",
                    "status-busy",
                    "status-streaming",
                    "status-invisible",
                    "success",
                    "warning",
                    "error",
                    "hover",
                ] as const
            ).map((key) => (
                <div
                    className="entry"
                    key={key}
                    style={{ backgroundColor: theme.getVariable(key) }}>
                    <div className="input">
                        <input
                            type="color"
                            value={theme.getVariable(key)}
                            onChange={(el) =>
                                setVariable({
                                    key,
                                    value: el.currentTarget.value,
                                })
                            }
                        />
                    </div>
                    <span
                        style={{
                            color: theme.getContrastingVariable(
                                key,
                                theme.getVariable("primary-background"),
                            ),
                        }}>
                        {key}
                    </span>
                    <div className="override">
                        <div
                            className="picker"
                            onClick={(e) =>
                                e.currentTarget.parentElement?.parentElement
                                    ?.querySelector("input")
                                    ?.click()
                            }>
                            <Pencil size={24} />
                        </div>
                        <InputBox
                            type="text"
                            className="text"
                            value={theme.getVariable(key)}
                            onChange={(el) =>
                                setVariable({
                                    key,
                                    value: el.currentTarget.value,
                                })
                            }
                        />
                    </div>
                </div>
            ))}
        </Container>
    );
});
