/// <reference types="node" />
import { Message, MessageRelation } from './pgoutput.types';
export declare class PgoutputParser {
    _typeCache: Map<number, {
        typeSchema: string;
        typeName: string;
    }>;
    _relationCache: Map<number, MessageRelation>;
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
