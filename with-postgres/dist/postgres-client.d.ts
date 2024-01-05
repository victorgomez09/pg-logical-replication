import postgres from "postgres";
import { PgClientOptions, WebSocketOptions } from "./types";
export declare class PostgresJsClient {
    private _sql;
    private _ws?;
    constructor(options: PgClientOptions, wsOptions?: WebSocketOptions);
    subscribeChanges(pattern: string): Promise<void>;
    get sql(): postgres.Sql<{}>;
}
