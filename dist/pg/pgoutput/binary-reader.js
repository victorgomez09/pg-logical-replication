"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryReader = void 0;
const util_1 = require("util");
// should not use { fatal: true } because ErrorResponse can use invalid utf8 chars
const textDecoder = new util_1.TextDecoder();
// https://www.postgresql.org/docs/14/protocol-message-types.html
class BinaryReader {
    constructor(_b) {
        this._b = _b;
        this._p = 0;
    }
    readUint8() {
        this.checkSize(1);
        return this._b[this._p++];
    }
    readInt16() {
        this.checkSize(2);
        return (this._b[this._p++] << 8) | this._b[this._p++];
    }
    readInt32() {
        this.checkSize(4);
        return ((this._b[this._p++] << 24) |
            (this._b[this._p++] << 16) |
            (this._b[this._p++] << 8) |
            this._b[this._p++]);
    }
    readString() {
        const endIdx = this._b.indexOf(0x00, this._p);
        if (endIdx < 0) {
            // TODO PgError.protocol_violation
            throw Error('unexpected end of message');
        }
        const strBuf = this._b.subarray(this._p, endIdx);
        this._p = endIdx + 1;
        return this.decodeText(strBuf);
    }
    decodeText(strBuf) {
        return textDecoder.decode(strBuf);
    }
    read(n) {
        this.checkSize(n);
        return this._b.subarray(this._p, (this._p += n));
    }
    checkSize(n) {
        if (this._b.length < this._p + n) {
            // TODO PgError.protocol_violation
            throw Error('unexpected end of message');
        }
    }
    array(length, fn) {
        return Array.from({ length }, fn, this);
    }
    // replication helpers
    readLsn() {
        const h = this.readUint32();
        const l = this.readUint32();
        if (h === 0 && l === 0) {
            return null;
        }
        return `${h.toString(16).padStart(8, '0')}/${l
            .toString(16)
            .padStart(8, '0')}`.toUpperCase();
    }
    readTime() {
        // (POSTGRES_EPOCH_JDATE - UNIX_EPOCH_JDATE) * USECS_PER_DAY == 946684800000000
        return this.readUint64() + BigInt('946684800000000');
    }
    readUint64() {
        return (BigInt(this.readUint32()) << BigInt(32)) | BigInt(this.readUint32());
    }
    readUint32() {
        return this.readInt32() >>> 0;
    }
}
exports.BinaryReader = BinaryReader;
