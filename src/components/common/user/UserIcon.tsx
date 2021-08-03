import { MicrophoneOff } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Presence } from "revolt-api/types/Users";
import { User } from "revolt.js/dist/maps/Users";
import styled, { css } from "styled-components";

import { useContext } from "preact/hooks";

import { ThemeContext } from "../../../context/Theme";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

import IconBase, { IconBaseProps } from "../IconBase";
import fallback from "../assets/user.png";

type VoiceStatus = "muted";
interface Props extends IconBaseProps<User> {
    mask?: string;
    status?: boolean;
    voice?: VoiceStatus;
}

export function useStatusColour(user?: User) {
    const theme = useContext(ThemeContext);

    return user?.online && user?.status?.presence !== Presence.Invisible
        ? user?.status?.presence === Presence.Idle
            ? theme["status-away"]
            : user?.status?.presence === Presence.Busy
            ? theme["status-busy"]
            : theme["status-online"]
        : theme["status-invisible"];
}

const VoiceIndicator = styled.div<{ status: VoiceStatus }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        stroke: white;
    }

    ${(props) =>
        props.status === "muted" &&
        css`
            background: var(--error);
        `}
`;

export default observer(
    (props: Props & Omit<JSX.SVGAttributes<SVGSVGElement>, keyof Props>) => {
        const client = useContext(AppContext);

        const {
            target,
            attachment,
            size,
            voice,
            status,
            animate,
            mask,
            hover,
            children,
            as,
            ...svgProps
        } = props;
        const iconURL =
            client.generateFileURL(
                target?.avatar ?? attachment,
                { max_side: 256 },
                animate,
            ) ?? (target ? target.defaultAvatarURL : fallback);

        return (
            <IconBase
                {...svgProps}
                width={size}
                height={size}
                hover={hover}
                aria-hidden="true"
                viewBox="0 0 32 32">
                <foreignObject
                    x="0"
                    y="0"
                    width="32"
                    height="32"
                    class="icon"
                    mask={mask ?? (status ? "url(#user)" : undefined)}>
                    {<img src={iconURL} draggable={false} loading="lazy" />}
                </foreignObject>
                {props.status && (
                    <circle
                        cx="27"
                        cy="27"
                        r="5"
                        fill={useStatusColour(target)}
                    />
                )}
                {props.voice && (
                    <foreignObject x="22" y="22" width="10" height="10">
                        <VoiceIndicator status={props.voice}>
                            {props.voice === "muted" && (
                                <MicrophoneOff size={6} />
                            )}
                        </VoiceIndicator>
                    </foreignObject>
                )}
            </IconBase>
        );
    },
);
