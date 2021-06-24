import styled from "styled-components";
import { createContext } from "preact";
import { animateScroll } from "react-scroll";
import MessageRenderer from "./MessageRenderer";
import ConversationStart from './ConversationStart';
import useResizeObserver from "use-resize-observer";
import Preloader from "../../../components/ui/Preloader";
import RequiresOnline from "../../../context/revoltjs/RequiresOnline";
import { RenderState, ScrollState } from "../../../lib/renderer/types";
import { SingletonMessageRenderer } from "../../../lib/renderer/Singleton";
import { IntermediateContext } from "../../../context/intermediate/Intermediate";
import { ClientStatus, StatusContext } from "../../../context/revoltjs/RevoltClient";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { defer } from "../../../lib/defer";
import { internalEmit } from "../../../lib/eventEmitter";

const Area = styled.div`
    height: 100%;
    flex-grow: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    word-break: break-word;

    > div {
        display: flex;
        min-height: 100%;
        padding-bottom: 20px;
        flex-direction: column;
        justify-content: flex-end;
    }
`;

interface Props {
    id: string;
}

export const MessageAreaWidthContext = createContext(0);
export const MESSAGE_AREA_PADDING = 82;

export function MessageArea({ id }: Props) {
    const status = useContext(StatusContext);
    const { focusTaken } = useContext(IntermediateContext);

    // ? This is the scroll container.
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useResizeObserver<HTMLDivElement>({ ref });

    // ? Current channel state.
    const [state, setState] = useState<RenderState>({ type: "LOADING" });

    // ? useRef to avoid re-renders
    const scrollState = useRef<ScrollState>({ type: "Free" });

    const setScrollState = (v: ScrollState) => {
        if (v.type === 'StayAtBottom') {
            if (scrollState.current.type === 'Bottom' || atBottom()) {
                scrollState.current = { type: 'ScrollToBottom', smooth: v.smooth };
            } else {
                scrollState.current = { type: 'Free' };
            }
        } else {
            scrollState.current = v;
        }

        defer(() => {
            if (scrollState.current.type === "ScrollToBottom") {
                setScrollState({ type: "Bottom", scrollingUntil: + new Date() + 150 });
                
                animateScroll.scrollToBottom({
                    container: ref.current,
                    duration: scrollState.current.smooth ? 150 : 0
                });
            } else if (scrollState.current.type === "OffsetTop") {
                animateScroll.scrollTo(
                    Math.max(
                        101,
                        ref.current.scrollTop +
                            (ref.current.scrollHeight - scrollState.current.previousHeight)
                    ),
                    {
                        container: ref.current,
                        duration: 0
                    }
                );

                setScrollState({ type: "Free" });
            } else if (scrollState.current.type === "ScrollTop") {
                animateScroll.scrollTo(scrollState.current.y, {
                    container: ref.current,
                    duration: 0
                });

                setScrollState({ type: "Free" });
            }
        });

        /*if (v.type === 'StayAtBottom') {
            if (scrollState.current.type === 'Bottom' || atBottom()) {
                scrollState.current = { type: 'ScrollToBottom', smooth: v.smooth };
            } else {
                scrollState.current = { type: 'Free' };
            }
        } else {
            scrollState.current = v;
        }*/
    }

    // ? Determine if we are at the bottom of the scroll container.
    // -> https://stackoverflow.com/a/44893438
    // By default, we assume we are at the bottom, i.e. when we first load.
    const atBottom = (offset = 0) =>
        ref.current
            ? Math.floor(ref.current.scrollHeight - ref.current.scrollTop) -
                  offset <=
              ref.current.clientHeight
            : true;
    
    const atTop = (offset = 0) => ref.current.scrollTop <= offset;

    // ? Handle events from renderer.
    useEffect(() => {
        SingletonMessageRenderer.addListener('state', setState);
        return () => SingletonMessageRenderer.removeListener('state', setState);
    }, [ ]);

    useEffect(() => {
        SingletonMessageRenderer.addListener('scroll', setScrollState);
        return () => SingletonMessageRenderer.removeListener('scroll', setScrollState);
    }, [ scrollState ]);

    // ? Load channel initially.
    useEffect(() => {
        SingletonMessageRenderer.init(id);
    }, [ id ]);

    // ? If we are waiting for network, try again.
    useEffect(() => {
        switch (status) {
            case ClientStatus.ONLINE:
                if (state.type === 'WAITING_FOR_NETWORK') {
                    SingletonMessageRenderer.init(id);
                } else {
                    SingletonMessageRenderer.reloadStale(id);
                }

                break;
            case ClientStatus.OFFLINE:
            case ClientStatus.DISCONNECTED:
            case ClientStatus.CONNECTING:
                SingletonMessageRenderer.markStale();
                break;
        }
    }, [ status, state ]);

    // ? Scroll to the bottom before the browser paints.
    useLayoutEffect(() => {
        // ! FIXME: NO REACTIVITY
        if (scrollState.current.type === "ScrollToBottom") {
            setScrollState({ type: "Bottom", scrollingUntil: + new Date() + 150 });
            
            animateScroll.scrollToBottom({
                container: ref.current,
                duration: scrollState.current.smooth ? 150 : 0
            });
        } else if (scrollState.current.type === "OffsetTop") {
            animateScroll.scrollTo(
                Math.max(
                    101,
                    ref.current.scrollTop +
                        (ref.current.scrollHeight - scrollState.current.previousHeight)
                ),
                {
                    container: ref.current,
                    duration: 0
                }
            );

            setScrollState({ type: "Free" });
        } else if (scrollState.current.type === "ScrollTop") {
            animateScroll.scrollTo(scrollState.current.y, {
                container: ref.current,
                duration: 0
            });

            setScrollState({ type: "Free" });
        }
    }, [scrollState]);

    // ? When the container is scrolled.
    // ? Also handle StayAtBottom
    useEffect(() => {
        async function onScroll() {
            if (scrollState.current.type === "Free" && atBottom()) {
                setScrollState({ type: "Bottom" });
            } else if (scrollState.current.type === "Bottom" && !atBottom()) {
                if (scrollState.current.scrollingUntil && scrollState.current.scrollingUntil > + new Date()) return;
                setScrollState({ type: "Free" });
            }
        }

        ref.current.addEventListener("scroll", onScroll);
        return () => ref.current.removeEventListener("scroll", onScroll);
    }, [ref, scrollState]);

    // ? Top and bottom loaders.
    useEffect(() => {
        async function onScroll() {
            if (atTop(100)) {
                SingletonMessageRenderer.loadTop(ref.current);
            }

            if (atBottom(100)) {
                SingletonMessageRenderer.loadBottom(ref.current);
            }
        }

        ref.current.addEventListener("scroll", onScroll);
        return () => ref.current.removeEventListener("scroll", onScroll);
    }, [ref]);

    // ? Scroll down whenever the message area resizes.
    function stbOnResize() {
        if (!atBottom() && scrollState.current.type === "Bottom") {
            animateScroll.scrollToBottom({
                container: ref.current,
                duration: 0
            });

            setScrollState({ type: "Bottom" });
        }
    }

    // ? Scroll down when container resized.
    useLayoutEffect(() => {
        stbOnResize();
    }, [height]);

    // ? Scroll down whenever the window resizes.
    useLayoutEffect(() => {
        document.addEventListener("resize", stbOnResize);
        return () => document.removeEventListener("resize", stbOnResize);
    }, [ref, scrollState]);

    // ? Scroll to bottom when pressing 'Escape'.
    useEffect(() => {
        function keyUp(e: KeyboardEvent) {
            if (e.key === "Escape" && !focusTaken) {
                SingletonMessageRenderer.jumpToBottom(id, true);
                internalEmit("TextArea", "focus", "message");
            }
        }

        document.body.addEventListener("keyup", keyUp);
        return () => document.body.removeEventListener("keyup", keyUp);
    }, [ref, focusTaken]);

    return (
        <MessageAreaWidthContext.Provider value={(width ?? 0) - MESSAGE_AREA_PADDING}>
            <Area ref={ref}>
                <div>
                    {state.type === "LOADING" && <Preloader type="ring" />}
                    {state.type === "WAITING_FOR_NETWORK" && (
                        <RequiresOnline>
                            <Preloader type="ring" />
                        </RequiresOnline>
                    )}
                    {state.type === "RENDER" && (
                        <MessageRenderer id={id} state={state} />
                    )}
                    {state.type === "EMPTY" && <ConversationStart id={id} />}
                </div>
            </Area>
        </MessageAreaWidthContext.Provider>
    );
}
