import { createContext } from "preact";
import { Children } from "../types/Preact";
import { useForceUpdate } from "./revoltjs/hooks";
import { AppContext } from "./revoltjs/RevoltClient";
import type VoiceClient from "../lib/vortex/VoiceClient";
import type { ProduceType, VoiceUser } from "../lib/vortex/Types";
import { useContext, useEffect, useMemo, useRef, useState } from "preact/hooks";

export enum VoiceStatus {
    LOADING = 0,
    UNAVAILABLE,
    ERRORED,
    READY = 3,
    CONNECTING = 4,
    AUTHENTICATING,
    RTC_CONNECTING,
    CONNECTED
    // RECONNECTING
}

export interface VoiceOperations {
    connect: (channelId: string) => Promise<void>;
    disconnect: () => void;
    isProducing: (type: ProduceType) => boolean;
    startProducing: (type: ProduceType) => Promise<void>;
    stopProducing: (type: ProduceType) => Promise<void> | undefined;
}

export interface VoiceState {
    roomId?: string;
    status: VoiceStatus;
    participants?: Readonly<Map<string, VoiceUser>>;
}

export const VoiceContext = createContext<VoiceState>(undefined as any);
export const VoiceOperationsContext = createContext<VoiceOperations>(undefined as any);

type Props = {
    children: Children;
};

export default function Voice({ children }: Props) {
    const revoltClient = useContext(AppContext);
    const [client, setClient] = useState<VoiceClient | undefined>(undefined);
    const [state, setState] = useState<VoiceState>({
        status: VoiceStatus.LOADING,
        participants: new Map()
    });

    function setStatus(status: VoiceStatus, roomId?: string) {
        setState({
            status,
            roomId: roomId ?? client?.roomId,
            participants: client?.participants ?? new Map(),
        });
    }

    useEffect(() => {
        import('../lib/vortex/VoiceClient')
            .then(({ default: VoiceClient }) => {
                const client = new VoiceClient();
                setClient(client);

                if (!client?.supported()) {
                    setStatus(VoiceStatus.UNAVAILABLE);
                } else {
                    setStatus(VoiceStatus.READY);
                }
            })
            .catch(err => {
                console.error('Failed to load voice library!', err);
                setStatus(VoiceStatus.UNAVAILABLE);
            })
    }, []);

    const isConnecting = useRef(false);
    const operations: VoiceOperations = useMemo(() => {
        return {
            connect: async channelId => {
                if (!client?.supported())
                    throw new Error("RTC is unavailable");
                
                isConnecting.current = true;
                setStatus(VoiceStatus.CONNECTING, channelId);

                try {
                    const call = await revoltClient.channels.joinCall(
                        channelId
                    );

                    if (!isConnecting.current) {
                        setStatus(VoiceStatus.READY);
                        return;
                    }

                    // ! FIXME: use configuration to check if voso is enabled
                    // await client.connect("wss://voso.revolt.chat/ws");
                    await client.connect("wss://voso.revolt.chat/ws", channelId);

                    setStatus(VoiceStatus.AUTHENTICATING);

                    await client.authenticate(call.token);
                    setStatus(VoiceStatus.RTC_CONNECTING);

                    await client.initializeTransports();
                } catch (error) {
                    console.error(error);
                    setStatus(VoiceStatus.READY);
                }

                setStatus(VoiceStatus.CONNECTED);
                isConnecting.current = false;
            },
            disconnect: () => {
                if (!client?.supported())
                    throw new Error("RTC is unavailable");
            
                // if (status <= VoiceStatus.READY) return;
                // this will not update in this context

                isConnecting.current = false;
                client.disconnect();
                setStatus(VoiceStatus.READY);
            },
            isProducing: (type: ProduceType) => {
                switch (type) {
                    case "audio":
                        return client?.audioProducer !== undefined;
                }
            },
            startProducing: async (type: ProduceType) => {
                switch (type) {
                    case "audio": {
                        if (client?.audioProducer !== undefined) return console.log('No audio producer.'); // ! FIXME: let the user know
                        if (navigator.mediaDevices === undefined) return console.log('No media devices.'); // ! FIXME: let the user know
                        const mediaStream = await navigator.mediaDevices.getUserMedia(
                            {
                                audio: true
                            }
                        );

                        await client?.startProduce(
                            mediaStream.getAudioTracks()[0],
                            "audio"
                        );
                        return;
                    }
                }
            },
            stopProducing: (type: ProduceType) => {
                return client?.stopProduce(type);
            }
        }
    }, [ client ]);

    const { forceUpdate } = useForceUpdate();
    useEffect(() => {
        if (!client?.supported()) return;

        // ! FIXME: message for fatal:
        // ! get rid of these force updates
        // ! handle it through state or smth

        client.on("startProduce",  forceUpdate);
        client.on("stopProduce", forceUpdate);

        client.on("userJoined", forceUpdate);
        client.on("userLeft", forceUpdate);
        client.on("userStartProduce", forceUpdate);
        client.on("userStopProduce", forceUpdate);
        client.on("close", forceUpdate);

        return () => {
            client.removeListener("startProduce", forceUpdate);
            client.removeListener("stopProduce", forceUpdate);

            client.removeListener("userJoined", forceUpdate);
            client.removeListener("userLeft", forceUpdate);
            client.removeListener("userStartProduce", forceUpdate);
            client.removeListener("userStopProduce", forceUpdate);
            client.removeListener("close", forceUpdate);
        };
    }, [ client, state ]);

    return (
        <VoiceContext.Provider value={state}>
            <VoiceOperationsContext.Provider value={operations}>
                { children }
            </VoiceOperationsContext.Provider>
        </VoiceContext.Provider>
    );
}
