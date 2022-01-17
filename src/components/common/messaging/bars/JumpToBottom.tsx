import { DownArrowAlt } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js/dist/maps/Channels";
import styled, { css } from "styled-components/macro";

import { Text } from "preact-i18n";

import { internalEmit } from "../../../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../../../lib/isTouchscreenDevice";
import { getRenderer } from "../../../../lib/renderer/Singleton";

export const Bar = styled.div<{ position: "top" | "bottom"; accent?: boolean }>`
    z-index: 10;
    position: relative;

    ${(props) =>
        props.position === "top" &&
        css`
            top: 0;
        `}

    ${(props) =>
        props.position === "bottom" &&
        css`
            top: -28px;

            ${() =>
                isTouchscreenDevice &&
                css`
                    top: -90px;
                `}
        `}

    > button {
        height: 28px;
        width: 100%;
        position: absolute;
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        padding: 0 8px;
        border: 0;
        user-select: none;
        justify-content: space-between;
        transition: color ease-in-out 0.08s;

        ${(props) =>
            props.accent
                ? css`
                      color: var(--accent-contrast);
                      background-color: rgba(
                          var(--accent-rgb),
                          max(var(--min-opacity), 0.9)
                      );
                      backdrop-filter: blur(20px);
                  `
                : css`
                      color: var(--secondary-foreground);
                      background-color: rgba(
                          var(--secondary-background-rgb),
                          max(var(--min-opacity), 0.9)
                      );
                      backdrop-filter: blur(20px);
                  `}

        ${(props) =>
            props.position === "top"
                ? css`
                      top: 48px;
                      border-radius: 0 0 var(--border-radius)
                          var(--border-radius);
                  `
                : css`
                      border-radius: var(--border-radius) var(--border-radius) 0
                          0;
                  `}

                  ${() =>
            isTouchscreenDevice &&
            css`
                top: 56px;
            `}

        > div {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        &:hover {
            color: var(--primary-text);
        }

        &:active {
            transform: translateY(1px);
        }

        ${() =>
            isTouchscreenDevice &&
            css`
                height: 34px;
                padding: 0 12px;
            `}
    }
`;

export default observer(({ channel }: { channel: Channel }) => {
    const renderer = getRenderer(channel);
    if (renderer.state !== "RENDER" || renderer.atBottom) return null;

    return (
        <Bar position="bottom">
            <button
                onClick={() => {
                    renderer.jumpToBottom(true);
                    internalEmit("NewMessages", "hide");
                }}>
                <div>
                    <Text id="app.main.channel.misc.viewing_old" />
                </div>
                <div>
                    <Text id="app.main.channel.misc.jump_present" />{" "}
                    <DownArrowAlt size={18} />
                </div>
            </button>
        </Bar>
    );
});
