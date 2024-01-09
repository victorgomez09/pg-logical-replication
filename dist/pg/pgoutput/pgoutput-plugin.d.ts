/// <reference types="node" />
import { Client } from 'pg';
import { AbstractPlugin } from '../abstract.plugin';
import { Message, Options } from './pgoutput.types';
export declare class PgoutputPlugin extends AbstractPlugin<Options> {
    private parser;
    constructor(options: Options);
    get name(): string;
    parse(buffer: Buffer): Message;
    start(client: Client, slotName: string, lastLsn: string): Promise<any>;
}
