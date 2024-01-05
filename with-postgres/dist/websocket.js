"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocket = void 0;
const socket_io_1 = require("socket.io");
class WebSocket {
    constructor(options) {
        this._server = new socket_io_1.Server(options.port || 3000, {
            connectTimeout: options.connectionTimeout
        });
        if (options.trace === "trace") {
            this._server.on("connection", (socket) => {
                console.log(`Socket ${socket.id} connected`);
            });
            this._server.engine.on("connection_error", (err) => {
                console.log(err.req); // the request object
                console.log(err.code); // the error code, for example 1
                console.log(err.message); // the error message, for example "Session ID unknown"
                console.log(err.context); // some additional error context
            });
        }
    }
    get ws() {
        return this._server;
    }
}
exports.WebSocket = WebSocket;
