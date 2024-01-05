import { PgClientOptions, WebSocketOptions } from "./types";
export declare class PgClient {
    private _client;
    private _ws?;
    constructor(options: PgClientOptions, wsOptions?: WebSocketOptions);
    private _connect;
    subscribeChanges(pattern: string): Promise<import("pg").QueryResult<any> | undefined>;
    get query(): {
        <T extends import("pg").Submittable>(queryStream: T): T;
        <R extends any[] = any[], I extends any[] = any[]>(queryConfig: import("pg").QueryArrayConfig<I>, values?: I | undefined): Promise<import("pg").QueryArrayResult<R>>;
        <R_1 extends import("pg").QueryResultRow = any, I_1 extends any[] = any[]>(queryConfig: import("pg").QueryConfig<I_1>): Promise<import("pg").QueryResult<R_1>>;
        <R_2 extends import("pg").QueryResultRow = any, I_2 extends any[] = any[]>(queryTextOrConfig: string | import("pg").QueryConfig<I_2>, values?: I_2 | undefined): Promise<import("pg").QueryResult<R_2>>;
        <R_3 extends any[] = any[], I_3 extends any[] = any[]>(queryConfig: import("pg").QueryArrayConfig<I_3>, callback: (err: Error, result: import("pg").QueryArrayResult<R_3>) => void): void;
        <R_4 extends import("pg").QueryResultRow = any, I_4 extends any[] = any[]>(queryTextOrConfig: string | import("pg").QueryConfig<I_4>, callback: (err: Error, result: import("pg").QueryResult<R_4>) => void): void;
        <R_5 extends import("pg").QueryResultRow = any, I_5 extends any[] = any[]>(queryText: string, values: any[], callback: (err: Error, result: import("pg").QueryResult<R_5>) => void): void;
    };
}
