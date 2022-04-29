/* eslint-disable react-hooks/rules-of-hooks */
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js";

import { getRenderer } from "../../../lib/renderer/Singleton";

interface Props {
    channel: Channel;
}

export const ChannelDebugInfo = observer(({ channel }: Props) => {
    if (process.env.NODE_ENV !== "development") return null;
    const renderer = getRenderer(channel);

    return (
        <span style={{ display: "block", padding: "12px 10px 0 10px" }}>
            <span
                style={{
                    display: "block",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    fontWeight: "600",
                }}>
                Channel Info
            </span>
            <p style={{ fontSize: "10px", userSelect: "text" }}>
                State: <b>{renderer.state}</b> <br />
                Stale: <b>{renderer.stale ? "Yes" : "No"}</b> <br />
                Fetching: <b>{renderer.fetching ? "Yes" : "No"}</b> <br />
                <br />
                {renderer.state === "RENDER" && renderer.messages.length > 0 && (
                    <>
                        Start: <b>{renderer.messages[0]._id}</b> <br />
                        End:{" "}
                        <b>
                            {
                                renderer.messages[renderer.messages.length - 1]
                                    ._id
                            }
                        </b>{" "}
                        <br />
                        At Top: <b>{renderer.atTop ? "Yes" : "No"}</b> <br />
                        At Bottom: <b>{renderer.atBottom ? "Yes" : "No"}</b>
                    </>
                )}
            </p>
        </span>
    );
});
