import styled, { keyframes } from "styled-components/macro";

const skSpinner = keyframes`
    0%, 80%, 100% { 
        -webkit-transform: scale(0);
        transform: scale(0);
    }
    40% { 
        -webkit-transform: scale(1.0);
        transform: scale(1.0);
    }
`;

const prRing = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

const PreloaderBase = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    .spinner {
        width: 58px;
        display: flex;
        text-align: center;
        margin: 100px auto 0;
        justify-content: space-between;
    }

    .spinner > div {
        width: 14px;
        height: 14px;
        background-color: var(--tertiary-foreground);

        border-radius: 100%;
        display: inline-block;
        animation: ${skSpinner} 1.4s infinite ease-in-out both;
    }

    .spinner div:nth-child(1) {
        animation-delay: -0.32s;
    }

    .spinner div:nth-child(2) {
        animation-delay: -0.16s;
    }

    .ring {
        display: inline-block;
        position: relative;
        width: 48px;
        height: 52px;
    }

    .ring div {
        width: 32px;
        margin: 8px;
        height: 32px;
        display: block;
        position: absolute;
        box-sizing: border-box;
        border: 2px solid #fff;
        border-radius: var(--border-radius-half);
        animation: ${prRing} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: #fff transparent transparent transparent;
    }

    .ring div:nth-child(1) {
        animation-delay: -0.45s;
    }

    .ring div:nth-child(2) {
        animation-delay: -0.3s;
    }

    .ring div:nth-child(3) {
        animation-delay: -0.15s;
    }
`;

interface Props {
    type: "spinner" | "ring";
}

export default function Preloader({ type }: Props) {
    return (
        <PreloaderBase>
            <div class={type}>
                <div />
                <div />
                <div />
            </div>
        </PreloaderBase>
    );
}
