import { Attachment, Channels, EmbedImage, Servers } from "revolt.js/dist/api/objects";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";
import { internalSubscribe } from "../../lib/eventEmitter";
import { Action } from "../../components/ui/Modal";
import { useHistory } from "react-router-dom";
import { Children } from "../../types/Preact";
import { createContext } from "preact";
import { Prompt } from "react-router";
import Modals from './Modals';

export type Screen =
| { id: "none" }

// Modals
| { id: "signed_out" }
| { id: "error"; error: string }
| { id: "clipboard"; text: string }
| { id: "_prompt"; question: Children; content?: Children; actions: Action[] }
| ({ id: "special_prompt" } & (
    { type: "leave_group", target: Channels.GroupChannel } |
    { type: "close_dm", target: Channels.DirectMessageChannel } |
    { type: "leave_server", target: Servers.Server } |
    { type: "delete_server", target: Servers.Server } |
    { type: "delete_channel", target: Channels.TextChannel } |
    { type: "delete_message", target: Channels.Message } |
    { type: "create_invite", target: Channels.TextChannel | Channels.GroupChannel } |
    { type: "kick_member", target: Servers.Server, user: string } |
    { type: "ban_member", target: Servers.Server, user: string } |
    { type: "create_channel", target: Servers.Server }
)) |
({ id: "special_input" } & (
    { type: "create_group" | "create_server" | "set_custom_status" | "add_friend" }
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
          loginAfterSuccess?: true
      ) => Promise<void>;
  }

// Pop-overs
| { id: "image_viewer"; attachment?: Attachment; embed?: EmbedImage; }
| { id: "modify_account"; field: "username" | "email" | "password" }
| { id: "profile"; user_id: string }
| { id: "channel_info"; channel_id: string }
| {
      id: "user_picker";
      omit?: string[];
      callback: (users: string[]) => Promise<void>;
  };

export const IntermediateContext = createContext({
    screen: { id: "none" } as Screen,
    focusTaken: false
});

export const IntermediateActionsContext = createContext({
    openScreen: (screen: Screen) => {},
    writeClipboard: (text: string) => {}
});

interface Props {
    children: Children;
}

export default function Intermediate(props: Props) {
    const [screen, openScreen] = useState<Screen>({ id: "none" });
    const history = useHistory();

    const value = {
        screen,
        focusTaken: screen.id !== 'none'
    };

    const actions = useMemo(() => {
        return {
            openScreen: (screen: Screen) => openScreen(screen),
            writeClipboard: (text: string) => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text);
                } else {
                    actions.openScreen({ id: "clipboard", text });
                }
            }
        }
    }, []);

    useEffect(() => {
        const openProfile = (user_id: string) => openScreen({ id: "profile", user_id });
        const navigate = (path: string) => history.push(path);

        const subs = [
            internalSubscribe("Intermediate", "openProfile", openProfile),
            internalSubscribe("Intermediate", "navigate", navigate)
        ]

        return () => subs.map(unsub => unsub());
    }, []);

    return (
        <IntermediateContext.Provider value={value}>
            <IntermediateActionsContext.Provider value={actions}>
                { screen.id !== 'onboarding' && props.children }
                <Modals
                    {...value}
                    {...actions}
                    key={
                        screen.id
                    } /** By specifying a key, we reset state whenever switching screen. */
                />
                <Prompt
                    when={[ 'modify_account', 'special_prompt', 'special_input', 'image_viewer', 'profile', 'channel_info', 'user_picker' ].includes(screen.id)}
                    message={(_, action) => {
                        if (action === 'POP') {
                            openScreen({ id: 'none' });
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
