import { MicrophoneOff } from "@styled-icons/boxicons-regular";
import { VolumeMute } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Masquerade } from "revolt-api/types/Channels";
import { Presence } from "revolt-api/types/Users";
import { User } from "revolt.js/dist/maps/Users";
import { Nullable } from "revolt.js/dist/util/null";
import styled, { css } from "styled-components";

import { useContext } from "preact/hooks";

import { ThemeContext } from "../../../context/Theme";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import fallback from "../assets/user.png";

import IconBase, { IconBaseProps } from "../IconBase";

type VoiceStatus = "muted" | "deaf";
interface Props extends IconBaseProps<User> {
    status?: boolean;
    voice?: VoiceStatus;
    masquerade?: Masquerade;
    showServerIdentity?: boolean;
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
    border-radius: var(--border-radius-half);

    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        stroke: white;
    }

    ${(props) =>
        (props.status === "muted" || props.status === "deaf") &&
        css`
            background: var(--error);
        `}
`;

export default observer(
    (
        props: Props &
            Omit<
                JSX.SVGAttributes<SVGSVGElement>,
                keyof Props | "children" | "as"
            >,
    ) => {
        const client = useClient();

        const {
            target,
            attachment,
            size,
            status,
            animate,
            mask,
            hover,
            showServerIdentity,
            masquerade,
            ...svgProps
        } = props;

        let { url } = props;
        if (masquerade?.avatar) {
            url = masquerade.avatar;
        } else if (!url) {
            let override;
            if (target && showServerIdentity) {
                const { server } = useParams<{ server?: string }>();
                if (server) {
                    const member = client.members.getKey({
                        server,
                        user: target._id,
                    });

                    if (member?.avatar) {
                        override = member?.avatar;
                    }
                }
            }

            url =
                client.generateFileURL(
                    override ?? target?.avatar ?? attachment,
                    { max_side: 256 },
                    animate,
                ) ?? (target ? target.defaultAvatarURL : fallback);
        }

        return (
            <IconBase
                {...svgProps}
                width={size}
                height={size}
                hover={hover}
                borderRadius="--border-radius-user-icon"
                aria-hidden="true"
                viewBox="0 0 32 32">
                <foreignObject
                    x="0"
                    y="0"
                    width="32"
                    height="32"
                    class="icon"
                    mask={mask ?? (status ? "url(#user)" : undefined)}>
                    {<img src={url} draggable={false} loading="lazy" />}
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
                            {(props.voice === "deaf" && (
                                <VolumeMute size={6} />
                            )) ||
                                (props.voice === "muted" && (
                                    <MicrophoneOff size={6} />
                                ))}
                        </VoiceIndicator>
                    </foreignObject>
                )}
            </IconBase>
        );
    },
);
