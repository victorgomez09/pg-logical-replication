/// <reference types="node" />
import { Message, PgClientOptions, WebSocketOptions } from "./types";
export declare class PgClient {
    private _client;
    private _publicationNames;
    private _typeCache;
    private _relationCache;
    private _ws?;
    private _lsn;
    constructor(options: PgClientOptions, wsOptions?: WebSocketOptions);
    subscribeChanges(slotName: string): Promise<import("pg").QueryResult<any> | undefined>;
    parse(buf: Buffer): Message;
    private msgBegin;
    private msgOrigin;
    private msgType;
    private msgRelation;
    private readRelationReplicaIdentity;
    private readRelationColumn;
    private msgInsert;
    private msgUpdate;
    private msgDelete;
    private readKeyTuple;
    private readTuple;
    private msgTruncate;
    private msgMessage;
    private msgCommit;
    private acknowledge;
}
