import { useRenderState } from "../../../lib/renderer/Singleton";

interface Props {
    id: string;
}

export function ChannelDebugInfo({ id }: Props) {
    if (process.env.NODE_ENV !== "development") return null;
    let view = useRenderState(id);
    if (!view) return null;

    return (
        <span style={{ display: "block", padding: "12px 10px 0 10px" }}>
            <span
                style={{
                    display: "block",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    fontWeight: "600"
                }}
            >
                Channel Info
            </span>
            <p style={{ fontSize: "10px", userSelect: "text" }}>
                State: <b>{ view.type }</b> <br />
                { view.type === 'RENDER' && view.messages.length > 0 &&
                    <>
                        Start: <b>{view.messages[0]._id}</b> <br />
                        End: <b>{view.messages[view.messages.length - 1]._id}</b> <br />
                        At Top: <b>{view.atTop ? "Yes" : "No"}</b> <br />
                        At Bottom: <b>{view.atBottom ? "Yes" : "No"}</b>
                    </>
                }
            </p>
        </span>
    );
}
