import { Prompt } from "react-router";
import { useHistory } from "react-router-dom";
import { API, Channel, Message, Server, User } from "revolt.js";

import { createContext } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import type { Action } from "@revoltchat/ui/esm/components/design/atoms/display/Modal";

import { internalSubscribe } from "../../lib/eventEmitter";
import { determineLink } from "../../lib/links";

import { useApplicationState } from "../../mobx/State";

import Modals from "./Modals";

export type Screen =
    | { id: "none" }

    // Modals
    | { id: "signed_out" }
    | { id: "error"; error: string }
    | { id: "clipboard"; text: string }
    | { id: "token_reveal"; token: string; username: string }
    | { id: "external_link_prompt"; link: string }
    | { id: "sessions"; confirm: () => void }
    | {
          id: "_prompt";
          question: Children;
          content?: Children;
          actions: Action[];
      }
    | ({ id: "special_prompt" } & (
          | { type: "leave_group"; target: Channel }
          | { type: "close_dm"; target: Channel }
          | { type: "leave_server"; target: Server }
          | { type: "delete_server"; target: Server }
          | { type: "delete_channel"; target: Channel }
          | {
                type: "delete_bot";
                target: string;
                name: string;
                cb?: () => void;
            }
          | { type: "delete_message"; target: Message }
          | {
                type: "create_invite";
                target: Channel;
            }
          | { type: "kick_member"; target: Server; user: User }
          | { type: "ban_member"; target: Server; user: User }
          | { type: "unfriend_user"; target: User }
          | { type: "block_user"; target: User }
          | {
                type: "create_channel";
                target: Server;
                cb?: (
                    channel: Channel & {
                        channel_type: "TextChannel" | "VoiceChannel";
                    },
                ) => void;
            }
          | { type: "create_category"; target: Server }
      ))
    | ({ id: "special_input" } & (
          | {
                type:
                    | "create_group"
                    | "create_server"
                    | "set_custom_status"
                    | "add_friend";
            }
          | {
                type: "create_role";
                server: Server;
                callback: (id: string) => void;
            }
      ))
    | {
          id: "_input";
          question: Children;
          field: Children;
          defaultValue?: string;
          callback: (value: string) => Promise<void>;
      }
    | {
          id: "onboarding";
          callback: (
              username: string,
              loginAfterSuccess?: true,
          ) => Promise<void>;
      }

    // Pop-overs
    | { id: "profile"; user_id: string }
    | {
          id: "user_picker";
          omit?: string[];
          callback: (users: string[]) => Promise<void>;
      }
    | { id: "image_viewer"; attachment?: API.File; embed?: API.Image }
    | { id: "channel_info"; channel: Channel }
    | { id: "pending_requests"; users: User[] }
    | { id: "modify_account"; field: "username" | "email" | "password" }
    | { id: "create_bot"; onCreate: (bot: API.Bot) => void }
    | {
          id: "server_identity";
          server: Server;
      };

export const IntermediateContext = createContext({
    screen: { id: "none" },
    focusTaken: false,
});

export const IntermediateActionsContext = createContext<{
    openLink: (href?: string, trusted?: boolean) => boolean;
    openScreen: (screen: Screen) => void;
    writeClipboard: (text: string) => void;
}>({
    openLink: null!,
    openScreen: null!,
    writeClipboard: null!,
});

interface Props {
    children: Children;
}

export default function Intermediate(props: Props) {
    const [screen, openScreen] = useState<Screen>({ id: "none" });
    const settings = useApplicationState().settings;
    const history = useHistory();

    const value = {
        screen,
        focusTaken: screen.id !== "none",
    };

    const actions = useMemo(() => {
        return {
            openLink: (href?: string, trusted?: boolean) => {
                const link = determineLink(href);

                switch (link.type) {
                    case "profile": {
                        openScreen({ id: "profile", user_id: link.id });
                        return true;
                    }
                    case "navigate": {
                        history.push(link.path);
                        return true;
                    }
                    case "external": {
                        if (
                            !trusted &&
                            !settings.security.isTrustedOrigin(
                                link.url.hostname,
                            )
                        ) {
                            openScreen({
                                id: "external_link_prompt",
                                link: link.href,
                            });
                        } else {
                            window.open(link.href, "_blank", "noreferrer");
                        }
                    }
                }

                return true;
            },
            openScreen: (screen: Screen) => openScreen(screen),
            writeClipboard: (text: string) => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text);
                } else {
                    actions.openScreen({ id: "clipboard", text });
                }
            },
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const openProfile = (user_id: string) =>
            openScreen({ id: "profile", user_id });
        const navigate = (path: string) => history.push(path);

        const subs = [
            internalSubscribe(
                "Intermediate",
                "openProfile",
                openProfile as (...args: unknown[]) => void,
            ),
            internalSubscribe(
                "Intermediate",
                "navigate",
                navigate as (...args: unknown[]) => void,
            ),
        ];

        return () => subs.map((unsub) => unsub());
    }, [history]);

    return (
        <IntermediateContext.Provider value={value}>
            <IntermediateActionsContext.Provider value={actions}>
                {screen.id !== "onboarding" && props.children}
                <Modals
                    {...value}
                    {...actions}
                    key={
                        screen.id
                    } /** By specifying a key, we reset state whenever switching screen. */
                />
                <Prompt
                    when={[
                        "modify_account",
                        "special_prompt",
                        "special_input",
                        "image_viewer",
                        "profile",
                        "channel_info",
                        "pending_requests",
                        "user_picker",
                    ].includes(screen.id)}
                    message={(_, action) => {
                        if (action === "POP") {
                            openScreen({ id: "none" });
                            setTimeout(() => history.push(history.location), 0);

                            return false;
                        }

                        return true;
                    }}
                />
            </IntermediateActionsContext.Provider>
        </IntermediateContext.Provider>
    );
}

export const useIntermediate = () => useContext(IntermediateActionsContext);
