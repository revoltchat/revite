import { X, Minus, Square } from "@styled-icons/boxicons-regular";
import styled from "styled-components";

import wideSVG from "../../assets/wide.svg";

export const TITLEBAR_HEIGHT = "24px";
export const USE_TITLEBAR = window.isNative && !window.native.getConfig().frame;

const TitlebarBase = styled.div`
    height: ${TITLEBAR_HEIGHT};

    display: flex;
    user-select: none;
    align-items: center;

    .title {
        flex-grow: 1;
        -webkit-app-region: drag;

        font-size: 16px;
        font-weight: 600;
        margin-left: 4px;

        img {
            width: 60px;
        }
    }

    .actions {
        z-index: 100;
        display: flex;
        align-items: center;

        div {
            width: 24px;
            height: 24px;

            display: grid;
            place-items: center;
            transition: 0.2s ease background-color;

            &:hover {
                background: var(--primary-background);
            }

            &.error:hover {
                background: var(--error);
            }
        }
    }
`;

export function Titlebar() {
    return (
        <TitlebarBase>
            <span class="title">
                <img src={wideSVG} />
            </span>
            <div class="actions">
                <div onClick={window.native.min}>
                    <Minus size={20} />
                </div>
                <div onClick={window.native.max}>
                    <Square size={14} />
                </div>
                <div onClick={window.native.close} class="error">
                    <X size={20} />
                </div>
            </div>
        </TitlebarBase>
    );
}
