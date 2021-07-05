import { Consumer } from "mediasoup-client/lib/Consumer";
import {
    MediaKind,
    RtpCapabilities,
    RtpParameters,
} from "mediasoup-client/lib/RtpParameters";
import { SctpParameters } from "mediasoup-client/lib/SctpParameters";
import {
    DtlsParameters,
    IceCandidate,
    IceParameters,
} from "mediasoup-client/lib/Transport";

export enum WSEventType {
    UserJoined = "UserJoined",
    UserLeft = "UserLeft",

    UserStartProduce = "UserStartProduce",
    UserStopProduce = "UserStopProduce",
}

export enum WSCommandType {
    Authenticate = "Authenticate",
    RoomInfo = "RoomInfo",

    InitializeTransports = "InitializeTransports",
    ConnectTransport = "ConnectTransport",

    StartProduce = "StartProduce",
    StopProduce = "StopProduce",

    StartConsume = "StartConsume",
    StopConsume = "StopConsume",
    SetConsumerPause = "SetConsumerPause",
}

export enum WSErrorCode {
    NotConnected = 0,
    NotFound = 404,

    TransportConnectionFailure = 601,

    ProducerFailure = 611,
    ProducerNotFound = 614,

    ConsumerFailure = 621,
    ConsumerNotFound = 624,
}

export enum WSCloseCode {
    // Sent when the received data is not a string, or is unparseable
    InvalidData = 1003,
    Unauthorized = 4001,
    RoomClosed = 4004,
    // Sent when a client tries to send an opcode in the wrong state
    InvalidState = 1002,
    ServerError = 1011,
}

export interface VoiceError {
    error: WSErrorCode | WSCloseCode;
    message: string;
}

export type ProduceType = "audio"; //| "video" | "saudio" | "svideo";

export interface AuthenticationResult {
    userId: string;
    roomId: string;
    rtpCapabilities: RtpCapabilities;
}

export interface Room {
    id: string;
    videoAllowed: boolean;
    users: Map<string, VoiceUser>;
}

export interface VoiceUser {
    audio?: boolean;
    //video?: boolean,
    //saudio?: boolean,
    //svideo?: boolean,
}

export interface ConsumerList {
    audio?: Consumer;
    //video?: Consumer,
    //saudio?: Consumer,
    //svideo?: Consumer,
}

export interface TransportInitData {
    id: string;
    iceParameters: IceParameters;
    iceCandidates: IceCandidate[];
    dtlsParameters: DtlsParameters;
    sctpParameters: SctpParameters | undefined;
}

export interface TransportInitDataTuple {
    sendTransport: TransportInitData;
    recvTransport: TransportInitData;
}

export interface ConsumerData {
    id: string;
    producerId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
}
