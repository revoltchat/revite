import { X, Minus, Square } from "@styled-icons/boxicons-regular";
import { Wrench } from "@styled-icons/boxicons-solid";
import styled from "styled-components";

import Tooltip from "../common/Tooltip";
import UpdateIndicator from "../common/UpdateIndicator";

const TitlebarBase = styled.div`
    height: var(--titlebar-height);
    display: flex;
    gap: 6px;
    user-select: none;
    align-items: center;

    .title {
        flex-grow: 1;
        -webkit-app-region: drag;
        height: var(--titlebar-height);
        font-size: 16px;
        font-weight: 600;
        margin-inline-start: 10px;
        margin-top: 4px;
        gap: 8px;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        svg {
            height: calc(var(--titlebar-height) / 3);
            margin-bottom: 4px;
        }
    }

    .actions {
        z-index: 100;
        display: flex;
        align-items: center;

        div {
            width: calc(
                var(--titlebar-height) + var(--titlebar-action-padding)
            );
            height: var(--titlebar-height);

            display: grid;
            place-items: center;
            transition: 0.2s ease color;
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
            <div class="title">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 193.733 37.438">
                    <path
                        d="M23.393,1.382c0,2.787-1.52,4.46-4.764,4.46H13.258V-2.977H18.63C21.873-2.977,23.393-1.254,23.393,1.382Zm-24-11.555,5.2,7.213V25.4h8.666V11.973h2.078l7.4,13.43h9.781l-8.21-14.089A10.355,10.355,0,0,0,32.212,1.027c0-6.183-4.358-11.2-13.075-11.2Zm60.035,0H37.634V25.4H59.426V18.46H46.3v-7.8H57.906V3.966H46.3V-2.969H59.426Zm20.981,26.86-8.818-26.86H62.365L74.984,25.4H85.83L98.449-10.173H89.276Zm56.659-9.173c0-10.693-8.058-18.194-18.194-18.194-10.085,0-18.3,7.5-18.3,18.194a17.9,17.9,0,0,0,18.3,18.244A17.815,17.815,0,0,0,137.066,7.514Zm-27.62,0c0-6.335,3.649-10.338,9.426-10.338,5.676,0,9.376,4,9.376,10.338,0,6.233-3.7,10.338-9.376,10.338C113.095,17.852,109.446,13.747,109.446,7.514ZM141.88-10.173V25.4H161.9v-6.95H150.545V-10.173Zm22.248,7.2h9.426V25.4h8.666V-2.975h9.426v-7.2H164.128Z"
                        transform="translate(1.586 11.18)"
                        fill="var(--titlebar-logo-color)"
                        stroke="var(--titlebar-logo-color)"
                        stroke-width="1"
                    />
                </svg>
                {window.native.getConfig().build === "dev" && <Wrench />}
            </div>
            <div class="actions">
                <Tooltip
                    content="A new update is available!"
                    placement="bottom">
                    <UpdateIndicator style="titlebar" />
                </Tooltip>
            </div>
            <div class="actions">
                <div onClick={window.native.min}>
                    <Minus size={20} />
                </div>
                <div onClick={window.native.max}>
                    <Square size={14} />
                </div>
                <div onClick={window.native.close} class="error">
                    <X size={24} />
                </div>
            </div>
        </TitlebarBase>
    );
}
