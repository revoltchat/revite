import { User } from "revolt.js";
import { useContext } from "preact/hooks";
import { MicOff } from "@styled-icons/feather";
import styled, { css } from "styled-components";
import { ThemeContext } from "../../context/Theme";
import { Users } from "revolt.js/dist/api/objects";
import IconBase, { IconBaseProps } from "./IconBase";
import { AppContext } from "../../context/revoltjs/RevoltClient";

type VoiceStatus = "muted";
interface Props extends IconBaseProps<User> {
    status?: boolean;
    voice?: VoiceStatus;
}

export function useStatusColour(user?: User) {
    const theme = useContext(ThemeContext);

    return (
        user?.online &&
            user?.status?.presence !== Users.Presence.Invisible
                ? user?.status?.presence === Users.Presence.Idle
                    ? theme["status-away"]
                    : user?.status?.presence ===
                        Users.Presence.Busy
                    ? theme["status-busy"]
                    : theme["status-online"]
                : theme["status-invisible"]
    );
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

    ${ props => props.status === 'muted' && css`
        background: var(--error);
    ` }
`;

const fallback = '/assets/user.png';
export default function UserIcon(props: Props & Omit<JSX.SVGAttributes<SVGSVGElement>, keyof Props>) {
    const client = useContext(AppContext);

    const { target, attachment, size, voice, status, animate, children, as, ...svgProps } = props;
    const iconURL = client.generateFileURL(target?.avatar ?? attachment, { max_side: 256 }, animate)
        ?? (target && client.users.getDefaultAvatarURL(target._id));

    return (
        <IconBase {...svgProps}
            width={size}
            height={size}
            aria-hidden="true"
            viewBox="0 0 32 32">
            <foreignObject x="0" y="0" width="32" height="32">
                {
                    <img src={iconURL}
                        draggable={false}
                        onError={ e => {
                            let el = e.currentTarget;
                            if (el.src !== fallback) {
                                el.src = fallback
                            }
                        }} />
                }
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
                <foreignObject
                    x="22"
                    y="22"
                    width="10"
                    height="10">
                    <VoiceIndicator status={props.voice}>
                        {props.voice === "muted" && <MicOff size={6} />}
                    </VoiceIndicator>
                </foreignObject>
            )}
        </IconBase>
    );
}
