import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router-dom";
import { animateScroll } from "react-scroll";
import { Channel } from "revolt.js";
import styled from "styled-components/macro";
import useResizeObserver from "use-resize-observer";

import { createContext } from "preact";
import {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "preact/hooks";

import { Preloader } from "@revoltchat/ui";

import { defer } from "../../../lib/defer";
import { internalEmit, internalSubscribe } from "../../../lib/eventEmitter";
import { getRenderer } from "../../../lib/renderer/Singleton";
import { ScrollState } from "../../../lib/renderer/types";

import { useSession } from "../../../controllers/client/ClientController";
import RequiresOnline from "../../../controllers/client/jsx/RequiresOnline";
import { modalController } from "../../../controllers/modals/ModalController";
import ConversationStart from "./ConversationStart";
import MessageRenderer from "./MessageRenderer";

const Area = styled.div.attrs({ "data-scroll-offset": "with-padding" })`
    height: 100%;
    flex-grow: 1;
    min-height: 0;
    word-break: break-word;

    overflow-x: hidden;
    overflow-y: scroll;

    &::-webkit-scrollbar-thumb {
        min-height: 150px;
    }

    > div {
        display: flex;
        min-height: 100%;
        padding-bottom: 26px;
        flex-direction: column;
        justify-content: flex-end;
    }
`;

interface Props {
    last_id?: string;
    channel: Channel;
}

export const MessageAreaWidthContext = createContext(0);
export const MESSAGE_AREA_PADDING = 82;

export const MessageArea = observer(({ last_id, channel }: Props) => {
    const history = useHistory();
    const session = useSession()!;

    // ? Required data for message links.
    const { message } = useParams<{ message: string }>();
    const [highlight, setHighlight] = useState<string | undefined>(undefined);

    // ? This is the scroll container.
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useResizeObserver<HTMLDivElement>({ ref });

    // ? Current channel state.
    const renderer = getRenderer(channel);

    // ? useRef to avoid re-renders
    const scrollState = useRef<ScrollState>({ type: "Free" });

    const setScrollState = useCallback(
        (v: ScrollState) => {
            if (v.type === "StayAtBottom") {
                if (scrollState.current.type === "Bottom" || atBottom()) {
                    scrollState.current = {
                        type: "ScrollToBottom",
                        smooth: v.smooth,
                    };
                } else {
                    scrollState.current = { type: "Free" };
                }
            } else {
                scrollState.current = v;
            }

            defer(() => {
                if (scrollState.current.type === "ScrollToBottom") {
                    setScrollState({
                        type: "Bottom",
                        scrollingUntil: +new Date() + 150,
                    });

                    animateScroll.scrollToBottom({
                        container: ref.current,
                        duration: scrollState.current.smooth ? 150 : 0,
                    });
                } else if (scrollState.current.type === "ScrollToView") {
                    document
                        .getElementById(scrollState.current.id)
                        ?.scrollIntoView({ block: "center" });

                    setScrollState({ type: "Free" });
                } else if (scrollState.current.type === "OffsetTop") {
                    animateScroll.scrollTo(
                        Math.max(
                            101,
                            ref.current
                                ? ref.current.scrollTop +
                                      (ref.current.scrollHeight -
                                          scrollState.current.previousHeight)
                                : 101,
                        ),
                        {
                            container: ref.current,
                            duration: 0,
                        },
                    );

                    setScrollState({ type: "Free" });
                } else if (scrollState.current.type === "ScrollTop") {
                    animateScroll.scrollTo(scrollState.current.y, {
                        container: ref.current,
                        duration: 0,
                    });

                    setScrollState({ type: "Free" });
                }

                defer(() => renderer.complete());
            });
        },
        // eslint-disable-next-line
        [scrollState],
    );

    // ? Determine if we are at the bottom of the scroll container.
    // -> https://stackoverflow.com/a/44893438
    // By default, we assume we are at the bottom, i.e. when we first load.
    const atBottom = (offset = 0) =>
        ref.current
            ? Math.floor(ref.current?.scrollHeight - ref.current?.scrollTop) -
                  offset <=
              ref.current?.clientHeight
            : true;

    const atTop = (offset = 0) =>
        ref.current ? ref.current.scrollTop <= offset : false;

    // ? Handle global jump to bottom, e.g. when editing last message in chat.
    useEffect(() => {
        return internalSubscribe("MessageArea", "jump_to_bottom", () =>
            setScrollState({ type: "ScrollToBottom" }),
        );
    }, [setScrollState]);

    // ? Handle events from renderer.
    useLayoutEffect(
        () => setScrollState(renderer.scrollState),
        // eslint-disable-next-line
        [renderer.scrollState],
    );

    // ? Load channel initially.
    useEffect(() => {
        if (message) return;
        if (renderer.state === "RENDER") {
            runInAction(() => (renderer.fetching = true));

            if (renderer.scrollAnchored) {
                setScrollState({ type: "ScrollToBottom" });
            } else {
                setScrollState({
                    type: "ScrollTop",
                    y: renderer.scrollPosition,
                });
            }
        } else {
            renderer.init();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ? If message present or changes, load it as well.
    useEffect(() => {
        if (message) {
            setHighlight(message);
            renderer.init(message);

            if (channel.channel_type === "TextChannel") {
                history.push(
                    `/server/${channel.server_id}/channel/${channel._id}`,
                );
            } else {
                history.push(`/channel/${channel._id}`);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message]);

    // ? If we are waiting for network, try again.
    useEffect(() => {
        switch (session.state) {
            case "Online":
                if (renderer.state === "WAITING_FOR_NETWORK") {
                    renderer.init();
                } else {
                    renderer.reloadStale();
                }

                break;
            case "Offline":
            case "Disconnected":
            case "Connecting":
                renderer.markStale();
                break;
        }
    }, [renderer, session.state]);

    // ? When the container is scrolled.
    // ? Also handle StayAtBottom
    useEffect(() => {
        const current = ref.current;
        if (!current) return;

        async function onScroll() {
            if (scrollState.current.type === "Free" && atBottom()) {
                setScrollState({ type: "Bottom" });
            } else if (scrollState.current.type === "Bottom" && !atBottom()) {
                if (
                    scrollState.current.scrollingUntil &&
                    scrollState.current.scrollingUntil > +new Date()
                )
                    return;
                setScrollState({ type: "Free" });
            }
        }

        current.addEventListener("scroll", onScroll);
        return () => current.removeEventListener("scroll", onScroll);
    }, [ref, scrollState, setScrollState]);

    // ? Top and bottom loaders.
    useEffect(() => {
        const current = ref.current;
        if (!current) return;

        async function onScroll() {
            renderer.scrollPosition = current!.scrollTop;

            if (atTop(100)) {
                renderer.loadTop(current!);
            }

            if (atBottom(100)) {
                renderer.loadBottom(current!);
            }

            if (atBottom()) {
                renderer.scrollAnchored = true;
            } else {
                renderer.scrollAnchored = false;
            }
        }

        current.addEventListener("scroll", onScroll);
        return () => current.removeEventListener("scroll", onScroll);
    }, [ref, renderer]);

    // ? Scroll down whenever the message area resizes.
    const stbOnResize = useCallback(() => {
        if (!atBottom() && scrollState.current.type === "Bottom") {
            animateScroll.scrollToBottom({
                container: ref.current,
                duration: 0,
            });

            setScrollState({ type: "Bottom" });
        }
    }, [setScrollState]);

    // ? Scroll down when container resized.
    useLayoutEffect(() => {
        stbOnResize();
    }, [stbOnResize, height]);

    // ? Scroll down whenever the window resizes.
    useLayoutEffect(() => {
        document.addEventListener("resize", stbOnResize);
        return () => document.removeEventListener("resize", stbOnResize);
    }, [ref, scrollState, stbOnResize]);

    // ? Scroll to bottom when pressing 'Escape'.
    useEffect(() => {
        function keyUp(e: KeyboardEvent) {
            if (e.key === "Escape" && !modalController.isVisible) {
                renderer.jumpToBottom(true);
                internalEmit("TextArea", "focus", "message");
            }
        }

        document.body.addEventListener("keyup", keyUp);
        return () => document.body.removeEventListener("keyup", keyUp);
    }, [renderer, ref]);

    return (
        <MessageAreaWidthContext.Provider
            value={(width ?? 0) - MESSAGE_AREA_PADDING}>
            <Area ref={ref}>
                <div>
                    {renderer.state === "LOADING" && <Preloader type="ring" />}
                    {renderer.state === "WAITING_FOR_NETWORK" && (
                        <RequiresOnline>
                            <Preloader type="ring" />
                        </RequiresOnline>
                    )}
                    {renderer.state === "RENDER" && (
                        <MessageRenderer
                            last_id={last_id}
                            renderer={renderer}
                            highlight={highlight}
                        />
                    )}
                    {renderer.state === "EMPTY" && (
                        <ConversationStart channel={channel} />
                    )}
                </div>
            </Area>
        </MessageAreaWidthContext.Provider>
    );
});
