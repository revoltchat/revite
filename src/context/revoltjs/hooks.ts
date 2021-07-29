import { Client, PermissionCalculator } from "revolt.js";

import { useContext, useEffect, useState } from "preact/hooks";

//#region Hooks v1 (deprecated)
import { AppContext } from "./RevoltClient";

export interface HookContext {
    client: Client;
    forceUpdate: () => void;
}

export function useForceUpdate(context?: HookContext): HookContext {
    const client = useContext(AppContext);
    if (context) return context;

    const H = useState(0);
    let updateState: (_: number) => void;
    if (Array.isArray(H)) {
        const [, u] = H;
        updateState = u;
    } else {
        console.warn("Failed to construct using useState.");
        updateState = () => {};
    }

    return { client, forceUpdate: () => updateState(Math.random()) };
}

export function useUserPermission(id: string, context?: HookContext) {
    const ctx = useForceUpdate(context);

    const mutation = (target: string) => target === id && ctx.forceUpdate();
    useEffect(() => {
        ctx.client.users.addListener("update", mutation);
        return () => ctx.client.users.removeListener("update", mutation);
    }, [id]);

    const calculator = new PermissionCalculator(ctx.client);
    return calculator.forUser(id);
}

export function useChannelPermission(id: string, context?: HookContext) {
    const ctx = useForceUpdate(context);

    const channel = ctx.client.channels.get(id);
    const server =
        channel &&
        (channel.channel_type === "TextChannel" ||
            channel.channel_type === "VoiceChannel")
            ? channel.server
            : undefined;

    const mutation = (target: string) => target === id && ctx.forceUpdate();
    const mutationServer = (target: string) =>
        target === server && ctx.forceUpdate();
    const mutationMember = (target: string) =>
        target.substr(26) === ctx.client.user!._id && ctx.forceUpdate();

    useEffect(() => {
        ctx.client.channels.addListener("update", mutation);

        if (server) {
            ctx.client.servers.addListener("update", mutationServer);
            ctx.client.members.addListener("update", mutationMember);
        }

        return () => {
            ctx.client.channels.removeListener("update", mutation);

            if (server) {
                ctx.client.servers.removeListener("update", mutationServer);
                ctx.client.members.removeListener("update", mutationMember);
            }
        };
    }, [id]);

    const calculator = new PermissionCalculator(ctx.client);
    return calculator.forChannel(id);
}

export function useServerPermission(id: string, context?: HookContext) {
    const ctx = useForceUpdate(context);

    const mutation = (target: string) => target === id && ctx.forceUpdate();
    const mutationMember = (target: string) =>
        target.substr(26) === ctx.client.user!._id && ctx.forceUpdate();

    useEffect(() => {
        ctx.client.servers.addListener("update", mutation);
        ctx.client.members.addListener("update", mutationMember);

        return () => {
            ctx.client.servers.removeListener("update", mutation);
            ctx.client.members.removeListener("update", mutationMember);
        };
    }, [id]);

    const calculator = new PermissionCalculator(ctx.client);
    return calculator.forServer(id);
}
//#endregion
