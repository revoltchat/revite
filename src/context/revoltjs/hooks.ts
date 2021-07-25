import isEqual from "lodash.isequal";
import { Client, PermissionCalculator } from "revolt.js";
import { Channels, Servers, Users } from "revolt.js/dist/api/objects";
import Collection from "revolt.js/dist/maps/Collection";

import { useContext, useEffect, useState } from "preact/hooks";

//#region Hooks v1
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

// TODO: utils.d.ts maybe?
type PickProperties<T, U> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends U ? K : never;
    }[keyof T]
>;

// The keys in Client that are an object
// for some reason undefined keeps appearing despite there being no reason to so it's filtered out
type ClientCollectionKey = Exclude<
    keyof PickProperties<Client, Collection<any>>,
    undefined
>;

function useObject(
    type: ClientCollectionKey,
    id?: string | string[],
    context?: HookContext,
) {
    const ctx = useForceUpdate(context);

    function update(target: any) {
        if (
            typeof id === "string"
                ? target === id
                : Array.isArray(id)
                ? id.includes(target)
                : true
        ) {
            ctx.forceUpdate();
        }
    }

    const map = ctx.client[type];
    useEffect(() => {
        map.addListener("update", update);
        return () => map.removeListener("update", update);
    }, [id]);

    return typeof id === "string"
        ? map.get(id)
        : Array.isArray(id)
        ? id.map((x) => map.get(x))
        : map.toArray();
}

export function useUser(id?: string, context?: HookContext) {
    if (typeof id === "undefined") return;
    return useObject("users", id, context) as Readonly<Users.User> | undefined;
}

export function useSelf(context?: HookContext) {
    const ctx = useForceUpdate(context);
    return useUser(ctx.client.user!._id, ctx);
}

export function useUsers(ids?: string[], context?: HookContext) {
    return useObject("users", ids, context) as (
        | Readonly<Users.User>
        | undefined
    )[];
}

export function useChannel(id?: string, context?: HookContext) {
    if (typeof id === "undefined") return;
    return useObject("channels", id, context) as
        | Readonly<Channels.Channel>
        | undefined;
}

export function useChannels(ids?: string[], context?: HookContext) {
    return useObject("channels", ids, context) as (
        | Readonly<Channels.Channel>
        | undefined
    )[];
}

export function useServer(id?: string, context?: HookContext) {
    if (typeof id === "undefined") return;
    return useObject("servers", id, context) as
        | Readonly<Servers.Server>
        | undefined;
}

export function useServers(ids?: string[], context?: HookContext) {
    return useObject("servers", ids, context) as (
        | Readonly<Servers.Server>
        | undefined
    )[];
}

export function useMember(id?: string, context?: HookContext) {
    if (typeof id === "undefined") return;
    return useObject("members", id, context) as
        | Readonly<Servers.Member>
        | undefined;
}

export function useDMs(context?: HookContext) {
    const ctx = useForceUpdate(context);

    function mutation(target: string) {
        const channel = ctx.client.channels.get(target);
        if (channel) {
            if (
                channel.channel_type === "DirectMessage" ||
                channel.channel_type === "Group"
            ) {
                ctx.forceUpdate();
            }
        }
    }

    const map = ctx.client.channels;
    useEffect(() => {
        map.addListener("update", mutation);
        return () => map.removeListener("update", mutation);
    }, []);

    return map
        .toArray()
        .filter(
            (x) =>
                x.channel_type === "DirectMessage" ||
                x.channel_type === "Group" ||
                x.channel_type === "SavedMessages",
        ) as (
        | Channels.GroupChannel
        | Channels.DirectMessageChannel
        | Channels.SavedMessagesChannel
    )[];
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

//#region Hooks v2
type CollectionKeys = Exclude<
    keyof PickProperties<Client, Collection<any>>,
    undefined
>;

interface Depedency {
    key: CollectionKeys;
    id?: string;
}

export function useData<T>(
    cb: (client: Client) => T,
    dependencies: Depedency[],
): T {
    // ! FIXME: not sure if this may cost a lot
    const client = useContext(AppContext);
    const [data, setData] = useState(cb(client));

    useEffect(() => {
        let fns = dependencies.map((dependency) => {
            function update() {
                let generated = cb(client);
                if (!isEqual(data, generated)) {
                    setData(generated);
                }
            }

            client[dependency.key].addListener("update", update);
            return () =>
                client[dependency.key].removeListener("update", update);
        });

        return () => fns.forEach((x) => x());
    }, [data]);

    return data;
}
//#endregion
