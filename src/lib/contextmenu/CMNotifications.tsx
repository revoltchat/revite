import {
    At,
    Bell,
    BellOff,
    Check,
    CheckSquare,
    Block,
    Square,
    LeftArrowAlt,
} from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js";
import { Server } from "revolt.js";

import { ContextMenuWithData, MenuItem } from "preact-context-menu";
import { Text } from "preact-i18n";

import { LineDivider } from "@revoltchat/ui";

import { useApplicationState } from "../../mobx/State";
import { NotificationState } from "../../mobx/stores/NotificationOptions";

interface Action {
    key: string;
    type: "channel" | "server";
    state?: NotificationState;
}

/**
 * Provides a context menu for controlling notification options.
 */
export default observer(() => {
    const notifications = useApplicationState().notifications;

    const contextClick = (data?: Action) =>
        data &&
        (data.type === "channel"
            ? notifications.setChannelState(data.key, data.state)
            : notifications.setServerState(data.key, data.state));

    return (
        <ContextMenuWithData id="NotificationOptions" onClose={contextClick}>
            {({ channel, server }: { channel?: Channel; server?: Server }) => {
                // Find the computed and actual state values for channel / server.
                const state = channel
                    ? notifications.getChannelState(channel._id)
                    : notifications.computeForServer(server!._id);

                const actual = channel
                    ? notifications.computeForChannel(channel)
                    : undefined;

                // If we're editing channel, show a default option too.
                const elements: Children[] = channel
                    ? [
                          <MenuItem
                              key="notif"
                              data={{
                                  key: channel._id,
                                  type: "channel",
                              }}>
                              <Text
                                  id={`app.main.channel.notifications.default`}
                              />
                              <div className="tip">
                                  {state !== undefined && <Square size={20} />}
                                  {state === undefined && (
                                      <CheckSquare size={20} />
                                  )}
                              </div>
                          </MenuItem>,
                          <LineDivider />,
                      ]
                    : [];

                /**
                 * Generate a new entry we can select.
                 * @param key Notification state
                 * @param icon Icon for this state
                 */
                function generate(key: string, icon: Children) {
                    elements.push(
                        <MenuItem
                            key={key}
                            data={{
                                key: channel ? channel._id : server!._id,
                                type: channel ? "channel" : "server",
                                state: key,
                            }}>
                            {icon}
                            <Text
                                id={`app.main.channel.notifications.${key}`}
                            />
                            {state === undefined && actual === key && (
                                <div className="tip">
                                    <LeftArrowAlt size={20} />
                                </div>
                            )}
                            {state === key && (
                                <div className="tip">
                                    <Check size={20} />
                                </div>
                            )}
                        </MenuItem>,
                    );
                }

                generate("all", <Bell size={24} />);
                generate("mention", <At size={24} />);
                generate("none", <BellOff size={24} />);
                generate("muted", <Block size={24} />);

                return elements;
            }}
        </ContextMenuWithData>
    );
});
