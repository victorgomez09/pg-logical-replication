/// <reference types="node" />
import { Client } from 'pg';
export declare abstract class AbstractPlugin<OPTION = any> {
    readonly options: OPTION;
    constructor(options: OPTION);
    abstract get name(): string;
    abstract start(client: Client, slotName: string, lastLsn: string): Promise<any>;
    abstract parse(buffer: Buffer): any;
}
