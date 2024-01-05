import { PgClient } from "./pg-client";
import { PostgresJsClient } from "./postgres-client";
import { PgClientOptions, WebSocketOptions } from "./types";

export const createPostgresClient = (options: PgClientOptions, socketOptions: WebSocketOptions) => {
    return new PostgresJsClient(options, socketOptions);
}

export const createPgClient = (options: PgClientOptions, socketOptions: WebSocketOptions) => {
    return new PgClient(options, socketOptions);
}