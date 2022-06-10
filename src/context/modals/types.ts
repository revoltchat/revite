import { API, Client } from "revolt.js";

export type Modal = {
    key?: string;
} & (
    | ({
          type: "mfa_flow";
          callback: (ticket: API.MFATicket) => void;
      } & (
          | {
                state: "known";
                client: Client;
            }
          | {
                state: "unknown";
                available_methods: API.MFAMethod[];
                ticket: API.MFATicket & { validated: false };
            }
      ))
    | {
          type: "test";
      }
);

export type ModalProps<T extends Modal["type"]> = Modal & { type: T } & {
    onClose: () => void;
};
