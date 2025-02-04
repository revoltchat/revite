import { LeftArrow, LeftArrowAlt, Pin, UpArrowAlt } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Channel } from "revolt.js";
import { decodeTime } from "ulid";
import { isDesktop, isMobile, isTablet } from "react-device-detect";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { internalSubscribe } from "../../../../lib/eventEmitter";
import { getRenderer } from "../../../../lib/renderer/Singleton";

import { dayjs } from "../../../../context/Locale";
import styled, { css } from "styled-components/macro";

import classNames from "classnames";
import { isTouchscreenDevice } from "../../../../lib/isTouchscreenDevice";
import { useClient } from "../../../../controllers/client/ClientController";
import Message from "../Message";
import { API, Message as MessageI, Nullable } from "revolt.js";

export const PinBar = styled.div<{ position: "top" | "bottom"; accent?: boolean }>`
    z-index: 2;
    position: relative;

    @keyframes bottomBounce {
        0% {
            transform: translateY(33px);
        }
        100% {
            transform: translateY(0px);
        }
    }

    @keyframes topBounce {
        0% {
            transform: translateY(-33px);
        }
        100% {
            transform: translateY(0px);
        }
    }

    ${(props) =>
        props.position === "top" &&
        css`
            top: 0;
            animation: topBounce 1s cubic-bezier(0.2, 0.9, 0.5, 1.16)
                forwards;
        `}

    ${(props) =>
        props.position === "bottom" &&
        css`
            top: -28px;
            animation: bottomBounce 340ms cubic-bezier(0.2, 0.9, 0.5, 1.16)
                forwards;

            ${() =>
                isTouchscreenDevice &&
                css`
                    top: -90px;
                `}
        `}

    > div {
      ${() =>
        isMobile ?
            css`
            width: 100%;
                ` : isDesktop ?
                css`
                 width: 40%;`
                :
                css`
                 width: 70%;
                    `
    }
        right : 0px !important;
        height: auto;
        max-height: 600px;
        min-height: 120px;
        position: absolute;
        display: block;
        align-items: center;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        padding: 0 8px;
        user-select: none;
        justify-content: space-between;
        transition: color ease-in-out 0.08s;

        white-space: nowrap;
        overflow: scroll;
        text-overflow: ellipsis;

        ${(props) =>
        props.accent
            ? css`
                      color: var(--accent-contrast);
                      background-color: var(--hover)!important;
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
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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

    @media only screen and (max-width: 800px) {
        .right > span {
            display: none;
        }
    }
`;





export const PinIcon = styled.div<{ position: "top" | "bottom", accent?: boolean }>`
    z-index: 2;
    position: relative;

    @keyframes bottomBounce {
        0% {
            transform: translateY(33px);
        }
        100% {
            transform: translateY(0px);
        }
    }

    @keyframes topBounce {
        0% {
            transform: translateY(-33px);
        }
        100% {
            transform: translateY(0px);
        }
    }
   ${(props) =>
        props.accent
            ? css`
                      color: var(--accent-contrast);
                      background-color: var(--hover)!important;
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
        props.position === "top" &&
        css`
            top: 5;
            animation: topBounce 1s cubic-bezier(0.2, 0.9, 0.5, 1.16)
                forwards;
        `}

   
    > div {
        height: auto;
        width: auto;
        right : 5px !important;
        position: absolute;
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        padding: 8px 8px;
        user-select: none;
        justify-content: space-between;
        transition: color ease-in-out 0.08s;

        white-space: nowrap;
    
  ${(props) =>
        props.accent
            ? css`
                      color: var(--accent-contrast);
                      background-color: var(--hover)!important;
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
                      top: 52px;
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

        
    }

    @media only screen and (max-width: 800px) {
        .right > span {
            display: none;
        }
    }
`;




export default observer(
    ({ channel }: { channel: Channel; }) => {
        const [hidden, setHidden] = useState(true);
        const unhide = () => setHidden(false);
        const renderer = getRenderer(channel);
        useEffect(() => {
            // Subscribe to the update event for pinned messages
            const unsubscribe = internalSubscribe(
                "PinnedMessage",
                "update",
                (newMessage: unknown) => {
                    const message = newMessage as MessageI;
                    if (!renderer.pinned_messages.find((msg) => msg._id === message._id)) {
                        renderer.pinned_messages.push(message);
                    }
                }
            );

            // Cleanup subscription on unmount
            return () => unsubscribe();
        }, [renderer]);


        const history = useHistory();
        if (renderer.state !== "RENDER") return null;
        function truncateText(text: string, chars: number) {
            if (text.length > chars) {
                return text.slice(0, chars) + "..";
            }
            return text;
        }
        const client = useClient()


        let pinFound = false
        return (
            <>
                {channel.channel_type != "DirectMessage" && (
                    <PinIcon position="top" accent>
                        <div onClick={() => unhide()}>
                            <Pin size={24} />
                        </div>
                    </PinIcon>
                )}
                {!hidden && <PinBar accent position="top"  >
                    <div style={{ height: 'auto' }}>
                        <div
                            onClick={() => setHidden(true)}
                            style={{
                                backgroundColor: "var(--block)",
                                width: "100%",
                                position: "sticky",
                                top: "0px",
                                display: "flex",
                                zIndex: 2,
                                justifyContent: "space-between",
                                borderRadius: "5px",
                                padding: "8px 8px"

                            }}>

                            <LeftArrowAlt size={20} onClick={() => setHidden(true)} />

                            <Text
                                id="app.main.channel.misc.pinned_message_title"
                            />
                            <Pin size={20} />
                        </div>



                        <div style={{ display: 'grid', flexDirection: "column" }} >
                            {

                                renderer.pinned_messages.slice().reverse().map((msg, i) => {
                                    if (msg.is_pinned) {
                                        let content = msg.content ? truncateText(msg.content, 220) : ""
                                        pinFound = true
                                        return (

                                            <div
                                                onClick={() => {
                                                    // setHidden(true);
                                                    if (channel.channel_type === "TextChannel") {
                                                        history.push(
                                                            `/server/${channel.server_id}/channel/${channel._id}/${msg._id}`,
                                                        );
                                                    } else {
                                                        history.push(`/channel/${channel._id}/${msg._id}`);
                                                    }
                                                    setHidden(true)
                                                }}
                                                style={{ display: 'flex', paddingTop: "5px" }}
                                            >
                                                <Message
                                                    message={msg}
                                                    key={msg._id}
                                                    head={true}
                                                    content={
                                                        undefined
                                                    }
                                                    type_msg="pin"
                                                />
                                            </div>
                                        )
                                    }

                                })



                            }

                            {!renderer.atTop && <div

                                onClick={() => {
                                    // setHidden(true);
                                    renderer.loadTop()
                                }}


                                style={{ display: 'flex', paddingTop: "5px", justifyContent: "center" }}>

                                {/* <Text

                                    id="app.main.channel.misc.pinned_load_more"

                                /> */}
                            </div>}

                        </div>




                    </div>
                </PinBar>}
            </>
        );
    },
);
