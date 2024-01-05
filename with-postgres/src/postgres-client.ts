import postgres, { Sql } from "postgres";
import { Server } from "socket.io";

import { PgClientOptions, WebSocketOptions } from "./types";
import { WebSocket } from "./websocket";

export class PostgresJsClient {
    private _sql: Sql;
    private _ws?: Server;

    constructor(options: PgClientOptions, wsOptions?: WebSocketOptions) {
        this._sql = postgres({
            database: options.db,
            user: options.username,
            password: options.password,
            host: options.host || 'localhost',
            port: options.port || 5432,
            publications: options.publications
        });

        if (wsOptions) {
            this._ws = new WebSocket(wsOptions).ws;
        }
    }

    public async subscribeChanges(pattern: string) {
        await this._sql.subscribe(
            pattern,
            (row, { command, relation  }) => {
            if (this._ws) {
                this._ws.emit("changes", {
                  row,
                  command,
                  table: relation.table,
                  schema: relation.schema
                });
            }
            },
            () => {
              // Callback on initial connect and potential reconnects
              console.log('PG client listening changes')
            }
          )
    }

    get sql() {
        return this._sql;
    }
}