import { DownArrowAlt } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js/dist/maps/Channels";
import styled, { css } from "styled-components";

import { Text } from "preact-i18n";

import { internalEmit } from "../../../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../../../lib/isTouchscreenDevice";
import { getRenderer } from "../../../../lib/renderer/Singleton";

export const Bar = styled.div<{ position: "top" | "bottom"; accent?: boolean }>`
    z-index: 10;
    position: relative;

    > div {
        ${(props) =>
            props.position === "bottom" &&
            css`
                top: -26px;

                ${() =>
                    isTouchscreenDevice &&
                    css`
                        top: -32px;
                    `}
            `}

        height: 28px;
        width: 100%;
        position: absolute;
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 12px;
        padding: 0 8px;
        user-select: none;
        justify-content: space-between;
        transition: color ease-in-out 0.08s;

        ${(props) =>
            props.accent
                ? css`
                      color: var(--accent-contrast);
                      background: var(--accent);
                  `
                : css`
                      color: var(--secondary-foreground);
                      background: var(--secondary-background);
                  `}

        ${(props) =>
            props.position === "top"
                ? css`
                      border-radius: 0 0 var(--border-radius)
                          var(--border-radius);
                  `
                : css`
                      border-radius: var(--border-radius) var(--border-radius) 0
                          0;
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
            <div
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
            </div>
        </Bar>
    );
});
