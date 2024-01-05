import { Server } from "socket.io";
import { WebSocketOptions } from "./types";
export declare class WebSocket {
    private _server;
    constructor(options: WebSocketOptions);
    get ws(): Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
}
