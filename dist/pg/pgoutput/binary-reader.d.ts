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
