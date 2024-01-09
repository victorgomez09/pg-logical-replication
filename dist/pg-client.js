"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryReader = exports.PgClient = void 0;
const util_1 = require("util");
const pg_1 = require("pg");
const websocket_1 = require("./websocket");
class PgClient {
    constructor(options, wsOptions) {
        this._typeCache = new Map();
        this._relationCache = new Map();
        console.log('publications', options.publications);
        this._client = new pg_1.Client({
            database: options.db,
            user: options.username,
            password: options.password,
            host: options.host || 'localhost',
            port: options.port || 5432,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
            replication: 'database',
        });
        this._publicationNames = options.publications ? [options.publications] : [];
        this._lsn = '';
        if (wsOptions) {
            this._ws = new websocket_1.WebSocket(wsOptions).ws;
        }
    }
    async subscribeChanges(slotName) {
        try {
            await this._client.connect();
            const connection = this._client.connection;
            this._client.on("error", (error) => {
                console.log('error', error);
            });
            connection.once('replicationStart', () => {
                console.log('start');
            });
            connection.on('copyData', ({ chunk: buffer }) => {
                const lsn = buffer.readUInt32BE(1).toString(16).toUpperCase() + '/' + buffer.readUInt32BE(5).toString(16).toUpperCase();
                if (buffer[0] == 0x77) {
                    // XLogData
                    const object = this.parse(buffer.subarray(25));
                    if (object.tag === 'insert' || object.tag === "update" || object.tag === "delete") {
                        if (this._ws) {
                            this._ws.emit("changes", {
                                row: object.tag != "delete" ? object.new : {},
                                command: object.tag,
                                table: object.relation.name,
                                schema: object.relation.schema
                            });
                        }
                    }
                    // this._acknowledge(lsn);
                }
                else if (buffer[0] == 0x6b) {
                    // Primary keepalive message
                    const timestamp = Math.floor(buffer.readUInt32BE(9) * 4294967.296 + buffer.readUInt32BE(13) / 1000 + 946080000000);
                    const shouldRespond = !!buffer.readInt8(17);
                    // this.emit('heartbeat', lsn, timestamp, shouldRespond);
                    if (this._ws) {
                        this._ws.emit("heartbeat", lsn, timestamp, shouldRespond);
                    }
                }
                this._lsn = lsn;
            });
            const options = [
                `proto_version '${1}'`,
                `publication_names '${this._publicationNames || [].join(',')}'`,
            ];
            const sql = `START_REPLICATION SLOT "${slotName}" LOGICAL ${this._lsn || "0/00000000"} (${options.join(', ')})`;
            return this._client.query(sql);
        }
        catch (error) {
            console.log('error', error);
        }
    }
    parse(buf) {
        const reader = new BinaryReader(buf);
        const tag = reader.readUint8();
        switch (tag) {
            case 0x42 /*B*/:
                return this.msgBegin(reader);
            case 0x4f /*O*/:
                return this.msgOrigin(reader);
            case 0x59 /*Y*/:
                return this.msgType(reader);
            case 0x52 /*R*/:
                return this.msgRelation(reader);
            case 0x49 /*I*/:
                return this.msgInsert(reader);
            case 0x55 /*U*/:
                return this.msgUpdate(reader);
            case 0x44 /*D*/:
                return this.msgDelete(reader);
            case 0x54 /*T*/:
                return this.msgTruncate(reader);
            case 0x4d /*M*/:
                return this.msgMessage(reader);
            case 0x43 /*C*/:
                return this.msgCommit(reader);
            default:
                throw Error('unknown pgoutput message');
        }
    }
    msgBegin(reader) {
        // TODO lsn can be null if origin sended
        // https://github.com/postgres/postgres/blob/85c61ba8920ba73500e1518c63795982ee455d14/src/backend/replication/pgoutput/pgoutput.c#L409
        // https://github.com/postgres/postgres/blob/27b77ecf9f4d5be211900eda54d8155ada50d696/src/include/replication/reorderbuffer.h#L275
        return {
            tag: 'begin',
            commitLsn: reader.readLsn(),
            commitTime: reader.readTime(),
            xid: reader.readInt32(),
        };
    }
    msgOrigin(reader) {
        return {
            tag: 'origin',
            originLsn: reader.readLsn(),
            originName: reader.readString(),
        };
    }
    msgType(reader) {
        const typeOid = reader.readInt32();
        const typeSchema = reader.readString();
        const typeName = reader.readString();
        // mem leak not likely to happen because amount of types is usually small
        this._typeCache.set(typeOid, { typeSchema, typeName });
        return { tag: 'type', typeOid, typeSchema, typeName };
    }
    msgRelation(reader) {
        // lsn expected to be null
        // https://github.com/postgres/postgres/blob/27b77ecf9f4d5be211900eda54d8155ada50d696/src/backend/replication/walsender.c#L1342
        const relationOid = reader.readInt32();
        const schema = reader.readString();
        const name = reader.readString();
        const replicaIdentity = this.readRelationReplicaIdentity(reader);
        const columns = reader.array(reader.readInt16(), () => this.readRelationColumn(reader));
        const keyColumns = columns.filter((it) => it.flags & 0b1).map((it) => it.name);
        const msg = {
            tag: 'relation',
            relationOid,
            schema,
            name,
            replicaIdentity,
            columns,
            keyColumns,
        };
        // mem leak not likely to happen because amount of relations is usually small
        this._relationCache.set(relationOid, msg);
        return msg;
    }
    readRelationReplicaIdentity(reader) {
        // https://www.postgresql.org/docs/14/catalog-pg-class.html
        const ident = reader.readUint8();
        switch (ident) {
            case 0x64 /*d*/:
                return 'default';
            case 0x6e /*n*/:
                return 'nothing';
            case 0x66 /*f*/:
                return 'full';
            case 0x69 /*i*/:
                return 'index';
            default:
                throw Error(`unknown replica identity ${String.fromCharCode(ident)}`);
        }
    }
    readRelationColumn(reader) {
        const flags = reader.readUint8();
        const name = reader.readString();
        const typeOid = reader.readInt32();
        const typeMod = reader.readInt32();
        return {
            flags,
            name,
            typeOid,
            typeMod,
            typeSchema: null,
            typeName: null, // TODO resolve builtin type names?
            ...this._typeCache.get(typeOid),
            parser: pg_1.types.getTypeParser(typeOid),
        };
    }
    msgInsert(reader) {
        const relation = this._relationCache.get(reader.readInt32());
        if (!relation) {
            throw Error('missing relation');
        }
        reader.readUint8(); // consume the 'N' key
        return {
            tag: 'insert',
            relation,
            new: this.readTuple(reader, relation),
        };
    }
    msgUpdate(reader) {
        const relation = this._relationCache.get(reader.readInt32());
        if (!relation) {
            throw Error('missing relation');
        }
        let key = null;
        let old = null;
        let new_ = null;
        const subMsgKey = reader.readUint8();
        if (subMsgKey === 0x4b /*K*/) {
            key = this.readKeyTuple(reader, relation);
            reader.readUint8(); // consume the 'N' key
            new_ = this.readTuple(reader, relation);
        }
        else if (subMsgKey === 0x4f /*O*/) {
            old = this.readTuple(reader, relation);
            reader.readUint8(); // consume the 'N' key
            new_ = this.readTuple(reader, relation, old);
        }
        else if (subMsgKey === 0x4e /*N*/) {
            new_ = this.readTuple(reader, relation);
        }
        else {
            throw Error(`unknown submessage key ${String.fromCharCode(subMsgKey)}`);
        }
        return { tag: 'update', relation, key, old, new: new_ };
    }
    msgDelete(reader) {
        const relation = this._relationCache.get(reader.readInt32());
        if (!relation) {
            throw Error('missing relation');
        }
        let key = null;
        let old = null;
        const subMsgKey = reader.readUint8();
        if (subMsgKey === 0x4b /*K*/) {
            key = this.readKeyTuple(reader, relation);
        }
        else if (subMsgKey === 0x4f /*O*/) {
            old = this.readTuple(reader, relation);
        }
        else {
            throw Error(`unknown submessage key ${String.fromCharCode(subMsgKey)}`);
        }
        return { tag: 'delete', relation, key, old };
    }
    readKeyTuple(reader, relation) {
        const tuple = this.readTuple(reader, relation);
        const key = Object.create(null);
        for (const k of relation.keyColumns) {
            // If value is `null`, then it is definitely not part of key,
            // because key cannot have nulls by documentation.
            // And if we got `null` while reading keyOnly tuple,
            // then it means that `null` is not actual value
            // but placeholder of non-key column.
            key[k] = tuple[k] === null ? undefined : tuple[k];
        }
        return key;
    }
    readTuple(reader, { columns }, unchangedToastFallback) {
        const nfields = reader.readInt16();
        const tuple = Object.create(null);
        for (let i = 0; i < nfields; i++) {
            const { name, parser } = columns[i];
            const kind = reader.readUint8();
            switch (kind) {
                case 0x62: // 'b' binary
                    const bsize = reader.readInt32();
                    const bval = reader.read(bsize);
                    // dont need to .slice() because new buffer
                    // is created for each replication chunk
                    tuple[name] = bval;
                    break;
                case 0x74: // 't' text
                    const valsize = reader.readInt32();
                    const valbuf = reader.read(valsize);
                    const valtext = reader.decodeText(valbuf);
                    tuple[name] = parser(valtext);
                    break;
                case 0x6e: // 'n' null
                    tuple[name] = null;
                    break;
                case 0x75: // 'u' unchanged toast datum
                    tuple[name] = unchangedToastFallback?.[name];
                    break;
                default:
                    throw Error(`unknown attribute kind ${String.fromCharCode(kind)}`);
            }
        }
        return tuple;
    }
    msgTruncate(reader) {
        const nrels = reader.readInt32();
        const flags = reader.readUint8();
        return {
            tag: 'truncate',
            cascade: Boolean(flags & 0b1),
            restartIdentity: Boolean(flags & 0b10),
            relations: reader.array(nrels, () => this._relationCache.get(reader.readInt32())),
        };
    }
    msgMessage(reader) {
        const flags = reader.readUint8();
        return {
            tag: 'message',
            flags,
            transactional: Boolean(flags & 0b1),
            messageLsn: reader.readLsn(),
            prefix: reader.readString(),
            content: reader.read(reader.readInt32()),
        };
    }
    msgCommit(reader) {
        return {
            tag: 'commit',
            flags: reader.readUint8(), // reserved unused
            commitLsn: reader.readLsn(), // should be the same as begin.commitLsn
            commitEndLsn: reader.readLsn(),
            commitTime: reader.readTime(),
        };
    }
}
exports.PgClient = PgClient;
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
