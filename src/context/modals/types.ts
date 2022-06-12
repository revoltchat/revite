import { API, Client } from "revolt.js";

export type Modal = {
    key?: string;
} & (
    | ({
          type: "mfa_flow";
      } & (
          | {
                state: "known";
                client: Client;
                callback: (ticket: API.MFATicket) => void;
            }
          | {
                state: "unknown";
                available_methods: API.MFAMethod[];
                callback: (response: API.MFAResponse) => void;
            }
      ))
    | {
          type: "test";
      }
);

export type ModalProps<T extends Modal["type"]> = Modal & { type: T } & {
    onClose: () => void;
};
