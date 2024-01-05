import { Server, Socket } from "socket.io";
import { WebSocketOptions } from "./types";

export class WebSocket {
    private _server: Server;

    constructor(options: WebSocketOptions) {
        this._server = new Server(options.port || 3000, {
            connectTimeout: options.connectionTimeout
        })

        if (options.trace === "trace") {
            this._server.on("connection", (socket: Socket) => {
                console.log(`Socket ${socket.id} connected`)
            });

            this._server.engine.on("connection_error", (err) => {
                console.log(err.req);      // the request object
                console.log(err.code);     // the error code, for example 1
                console.log(err.message);  // the error message, for example "Session ID unknown"
                console.log(err.context);  // some additional error context
              });
        }
    }

    get ws() {
        return this._server;
    }
}