import EventEmitter from "eventemitter3";
import * as mediasoupClient from "mediasoup-client";
import { types } from "mediasoup-client";

import { Device, Producer, Transport } from "mediasoup-client/lib/types";

import Signaling from "./Signaling";
import {
    ProduceType,
    WSEventType,
    VoiceError,
    VoiceUser,
    ConsumerList,
    WSErrorCode,
} from "./Types";

const UnsupportedError = types.UnsupportedError;

interface VoiceEvents {
    ready: () => void;
    error: (error: Error) => void;
    close: (error?: VoiceError) => void;

    startProduce: (type: ProduceType) => void;
    stopProduce: (type: ProduceType) => void;

    userJoined: (userId: string) => void;
    userLeft: (userId: string) => void;

    userStartProduce: (userId: string, type: ProduceType) => void;
    userStopProduce: (userId: string, type: ProduceType) => void;
}

export default class VoiceClient extends EventEmitter<VoiceEvents> {
    private _supported: boolean;

    device?: Device;
    signaling: Signaling;

    sendTransport?: Transport;
    recvTransport?: Transport;

    userId?: string;
    roomId?: string;
    participants: Map<string, VoiceUser>;
    consumers: Map<string, ConsumerList>;

    audioProducer?: Producer;
    constructor() {
        super();
        this._supported = mediasoupClient.detectDevice() !== undefined;
        this.signaling = new Signaling();

        this.participants = new Map();
        this.consumers = new Map();

        this.signaling.on(
            "data",
            (json) => {
                const data = json.data;
                switch (json.type) {
                    case WSEventType.UserJoined: {
                        this.participants.set(data.id, {});
                        this.emit("userJoined", data.id);
                        break;
                    }
                    case WSEventType.UserLeft: {
                        this.participants.delete(data.id);
                        this.emit("userLeft", data.id);

                        if (this.recvTransport) this.stopConsume(data.id);
                        break;
                    }
                    case WSEventType.UserStartProduce: {
                        const user = this.participants.get(data.id);
                        if (user === undefined) return;
                        switch (data.type) {
                            case "audio":
                                user.audio = true;
                                break;
                            default:
                                throw new Error(
                                    `Invalid produce type ${data.type}`,
                                );
                        }

                        if (this.recvTransport)
                            this.startConsume(data.id, data.type);
                        this.emit("userStartProduce", data.id, data.type);
                        break;
                    }
                    case WSEventType.UserStopProduce: {
                        const user = this.participants.get(data.id);
                        if (user === undefined) return;
                        switch (data.type) {
                            case "audio":
                                user.audio = false;
                                break;
                            default:
                                throw new Error(
                                    `Invalid produce type ${data.type}`,
                                );
                        }

                        if (this.recvTransport)
                            this.stopConsume(data.id, data.type);
                        this.emit("userStopProduce", data.id, data.type);
                        break;
                    }
                }
            },
            this,
        );

        this.signaling.on(
            "error",
            (error) => {
                this.emit("error", new Error("Signaling error"));
            },
            this,
        );

        this.signaling.on(
            "close",
            (error) => {
                this.disconnect(
                    {
                        error: error.code,
                        message: error.reason,
                    },
                    true,
                );
            },
            this,
        );
    }

    supported() {
        return this._supported;
    }
    throwIfUnsupported() {
        if (!this._supported) throw new UnsupportedError("RTC not supported");
    }

    connect(address: string, roomId: string) {
        this.throwIfUnsupported();
        this.device = new Device();
        this.roomId = roomId;
        return this.signaling.connect(address);
    }

    disconnect(error?: VoiceError, ignoreDisconnected?: boolean) {
        if (!this.signaling.connected() && !ignoreDisconnected) return;
        this.signaling.disconnect();
        this.participants = new Map();
        this.consumers = new Map();
        this.userId = undefined;
        this.roomId = undefined;

        this.audioProducer = undefined;

        if (this.sendTransport) this.sendTransport.close();
        if (this.recvTransport) this.recvTransport.close();
        this.sendTransport = undefined;
        this.recvTransport = undefined;

        this.emit("close", error);
    }

    async authenticate(token: string) {
        this.throwIfUnsupported();
        if (this.device === undefined || this.roomId === undefined)
            throw new ReferenceError("Voice Client is in an invalid state");
        const result = await this.signaling.authenticate(token, this.roomId);
        let [room] = await Promise.all([
            this.signaling.roomInfo(),
            this.device.load({ routerRtpCapabilities: result.rtpCapabilities }),
        ]);

        this.userId = result.userId;
        this.participants = room.users;
    }

    async initializeTransports() {
        this.throwIfUnsupported();
        if (this.device === undefined)
            throw new ReferenceError("Voice Client is in an invalid state");
        const initData = await this.signaling.initializeTransports(
            this.device.rtpCapabilities,
        );

        this.sendTransport = this.device.createSendTransport(
            initData.sendTransport,
        );
        this.recvTransport = this.device.createRecvTransport(
            initData.recvTransport,
        );

        const connectTransport = (transport: Transport) => {
            transport.on("connect", ({ dtlsParameters }, callback, errback) => {
                this.signaling
                    .connectTransport(transport.id, dtlsParameters)
                    .then(callback)
                    .catch(errback);
            });
        };

        connectTransport(this.sendTransport);
        connectTransport(this.recvTransport);

        this.sendTransport.on("produce", (parameters, callback, errback) => {
            const type = parameters.appData.type;
            if (
                parameters.kind === "audio" &&
                type !== "audio" &&
                type !== "saudio"
            )
                return errback();
            if (
                parameters.kind === "video" &&
                type !== "video" &&
                type !== "svideo"
            )
                return errback();
            this.signaling
                .startProduce(type, parameters.rtpParameters)
                .then((id) => callback({ id }))
                .catch(errback);
        });

        this.emit("ready");
        for (let user of this.participants) {
            if (user[1].audio && user[0] !== this.userId)
                this.startConsume(user[0], "audio");
        }
    }

    private async startConsume(userId: string, type: ProduceType) {
        if (this.recvTransport === undefined)
            throw new Error("Receive transport undefined");
        const consumers = this.consumers.get(userId) || {};
        const consumerParams = await this.signaling.startConsume(userId, type);
        const consumer = await this.recvTransport.consume(consumerParams);
        switch (type) {
            case "audio":
                consumers.audio = consumer;
        }

        const mediaStream = new MediaStream([consumer.track]);
        const audio = new Audio();
        audio.srcObject = mediaStream;
        await this.signaling.setConsumerPause(consumer.id, false);
        audio.play();
        this.consumers.set(userId, consumers);
    }

    private async stopConsume(userId: string, type?: ProduceType) {
        const consumers = this.consumers.get(userId);
        if (consumers === undefined) return;
        if (type === undefined) {
            if (consumers.audio !== undefined) consumers.audio.close();
            this.consumers.delete(userId);
        } else {
            switch (type) {
                case "audio": {
                    if (consumers.audio !== undefined) {
                        consumers.audio.close();
                        this.signaling.stopConsume(consumers.audio.id);
                    }
                    consumers.audio = undefined;
                    break;
                }
            }

            this.consumers.set(userId, consumers);
        }
    }

    async startProduce(track: MediaStreamTrack, type: ProduceType) {
        if (this.sendTransport === undefined)
            throw new Error("Send transport undefined");
        const producer = await this.sendTransport.produce({
            track,
            appData: { type },
        });

        switch (type) {
            case "audio":
                this.audioProducer = producer;
                break;
        }

        const participant = this.participants.get(this.userId || "");
        if (participant !== undefined) {
            participant[type] = true;
            this.participants.set(this.userId || "", participant);
        }

        this.emit("startProduce", type);
    }

    async stopProduce(type: ProduceType) {
        let producer;
        switch (type) {
            case "audio":
                producer = this.audioProducer;
                this.audioProducer = undefined;
                break;
        }

        if (producer !== undefined) {
            producer.close();
            this.emit("stopProduce", type);
        }

        const participant = this.participants.get(this.userId || "");
        if (participant !== undefined) {
            participant[type] = false;
            this.participants.set(this.userId || "", participant);
        }

        try {
            await this.signaling.stopProduce(type);
        } catch (error) {
            if (error.error === WSErrorCode.ProducerNotFound) return;
            else throw error;
        }
    }
}
