import { API, Client, User, Member, Channel, Server, Message } from "revolt.js";

export type Modal = {
    key?: string;
} & (
    | {
          type:
              | "signed_out"
              | "create_group"
              | "create_server"
              | "custom_status"
              | "modify_displayname"
              | "add_friend";
      }
    | ({
          type: "mfa_flow";
      } & (
          | {
                state: "known";
                client: Client;
                callback: (ticket?: API.MFATicket) => void;
            }
          | {
                state: "unknown";
                available_methods: API.MFAMethod[];
                callback: (response?: API.MFAResponse) => void;
            }
      ))
    | { type: "mfa_recovery"; codes: string[]; client: Client }
    | {
          type: "mfa_enable_totp";
          identifier: string;
          secret: string;
          callback: (code?: string) => void;
      }
    | {
          type: "out_of_date";
          version: string;
      }
    | {
          type: "changelog";
          initial?: number;
      }
    | { type: "changelog_usernames" }
    | {
          type: "sign_out_sessions";
          client: Client;
          onDelete: () => void;
          onDeleting: () => void;
      }
    | {
          type: "show_token";
          name: string;
          token: string;
      }
    | {
          type: "error";
          error: string;
      }
    | {
          type: "clipboard";
          text: string;
      }
    | {
          type: "link_warning";
          link: string;
          callback: () => true;
      }
    | {
          type: "pending_friend_requests";
          users: User[];
      }
    | {
          type: "modify_account";
          client: Client;
          field: "username" | "email" | "password";
      }
    | {
          type: "server_identity";
          member: Member;
      }
    | {
          type: "channel_info";
          channel: Channel;
      }
    | {
          type: "server_info";
          server: Server;
      }
    | {
          type: "image_viewer";
          embed?: API.Image;
          attachment?: API.File;
      }
    | {
          type: "user_picker";
          omit?: string[];
          callback: (users: string[]) => Promise<void>;
      }
    | {
          type: "user_profile";
          user_id: string;
          isPlaceholder?: boolean;
          placeholderProfile?: API.UserProfile;
      }
    | {
          type: "create_bot";
          onCreate: (bot: API.Bot) => void;
      }
    | {
          type: "onboarding";
          callback: (
              username: string,
              loginAfterSuccess?: true,
          ) => Promise<void>;
      }
    | {
          type: "create_role";
          server: Server;
          callback: (id: string) => void;
      }
    | {
          type: "leave_group";
          target: Channel;
      }
    | {
          type: "close_dm";
          target: Channel;
      }
    | {
          type: "delete_channel";
          target: Channel;
      }
    | {
          type: "create_invite";
          target: Channel;
      }
    | {
          type: "leave_server";
          target: Server;
      }
    | {
          type: "delete_server";
          target: Server;
      }
    | {
          type: "delete_bot";
          target: string;
          name: string;
          cb?: () => void;
      }
    | {
          type: "delete_message";
          target: Message;
      }
    | {
          type: "kick_member";
          member: Member;
      }
    | {
          type: "ban_member";
          member: Member;
      }
    | {
          type: "unfriend_user";
          target: User;
      }
    | {
          type: "block_user";
          target: User;
      }
    | {
          type: "create_channel";
          target: Server;
          cb?: (channel: Channel) => void;
      }
    | {
          type: "create_category";
          target: Server;
      }
    | {
          type: "import_theme";
      }
    | {
          type: "report";
          target: Server | User | Message;
          messageId?: string;
      }
    | {
          type: "report_success";
          user?: User;
      }
);

export type ModalProps<T extends Modal["type"]> = Modal & { type: T } & {
    onClose: () => void;
    signal?: "close" | "confirm";
};
