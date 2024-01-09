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
}
export declare class BinaryReader {
    private _b;
    _p: number;
    constructor(_b: Uint8Array);
    readUint8(): number;
    readInt16(): number;
    readInt32(): number;
    readString(): string;
    decodeText(strBuf: Uint8Array): string;
    read(n: number): Uint8Array;
    checkSize(n: number): void;
    array<T>(length: number, fn: () => T): T[];
    readLsn(): string | null;
    readTime(): bigint;
    readUint64(): bigint;
    readUint32(): number;
}
