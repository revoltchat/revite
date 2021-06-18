import { Message } from "revolt.js/dist/api/objects";

export type MessageObject = Omit<Message, "edited"> & { edited?: string };
export function mapMessage(message: Partial<Message>) {
    const { edited, ...msg } = message;
    return {
        ...msg,
        edited: edited?.$date
    } as MessageObject;
}
