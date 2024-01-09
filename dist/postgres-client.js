"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresJsClient = void 0;
const postgres_1 = __importDefault(require("postgres"));
const websocket_1 = require("./websocket");
class PostgresJsClient {
    constructor(options, wsOptions) {
        this._sql = (0, postgres_1.default)({
            database: options.db,
            user: options.username,
            password: options.password,
            host: options.host || 'localhost',
            port: options.port || 5432,
            publications: options.publications
        });
        if (wsOptions) {
            this._ws = new websocket_1.WebSocket(wsOptions).ws;
        }
    }
    async subscribeChanges(pattern) {
        await this._sql.subscribe(pattern, (row, { command, relation }) => {
            if (this._ws) {
                this._ws.emit("changes", {
                    row,
                    command,
                    table: relation.table,
                    schema: relation.schema
                });
            }
        }, () => {
            // Callback on initial connect and potential reconnects
            console.log('PG client listening changes');
        });
    }
    get sql() {
        return this._sql;
    }
}
exports.PostgresJsClient = PostgresJsClient;
