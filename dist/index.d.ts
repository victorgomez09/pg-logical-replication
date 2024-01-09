import { PgClient } from "./pg-client";
import { PostgresJsClient } from "./postgres-client";
import { PgClientOptions, WebSocketOptions } from "./types";
export declare const createPostgresClient: (options: PgClientOptions, socketOptions: WebSocketOptions) => PostgresJsClient;
export declare const createPgClient: (options: PgClientOptions, socketOptions: WebSocketOptions) => PgClient;
