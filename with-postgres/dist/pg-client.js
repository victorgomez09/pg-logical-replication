"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgClient = void 0;
const websocket_1 = require("./websocket");
const pg_1 = require("pg");
class PgClient {
    constructor(options, wsOptions) {
        this._client = new pg_1.Client({
            database: options.db,
            user: options.username,
            password: options.password,
            host: options.host || 'localhost',
            port: options.port || 5432
        });
        // this._connect();
        this._client.on('error', (e) => console.log('error', e));
        if (wsOptions) {
            this._ws = new websocket_1.WebSocket(wsOptions).ws;
        }
    }
    async _connect() {
        try {
            // await this._client.end();
            await this._client.connect();
            console.log('pg connected to database');
        }
        catch (error) {
            console.log('error connecting', error);
        }
    }
    async subscribeChanges(pattern) {
        try {
            await this._connect();
            const connection = this._client.connection;
            connection.once('replicationStart', () => {
                // this._stop = false;
                // this.emit('start');
                // this.checkStandbyStatus(true);
                console.log('replication start');
            });
            connection.on('copyData', ({ chunk: buffer }) => {
                if (buffer[0] != 0x77 && buffer[0] != 0x6b) {
                    console.warn('Unknown message', buffer[0]);
                    return;
                }
                const lsn = buffer.readUInt32BE(1).toString(16).toUpperCase() + '/' + buffer.readUInt32BE(5).toString(16).toUpperCase();
                if (buffer[0] == 0x77) {
                    // XLogData
                    //   this.emit('data', lsn, plugin.parse(buffer.subarray(25)));
                    //   this._acknowledge(lsn);
                    console.log('data', buffer);
                }
                else if (buffer[0] == 0x6b) {
                    // Primary keepalive message
                    const timestamp = Math.floor(buffer.readUInt32BE(9) * 4294967.296 + buffer.readUInt32BE(13) / 1000 + 946080000000);
                    const shouldRespond = !!buffer.readInt8(17);
                    //   this.emit('heartbeat', lsn, timestamp, shouldRespond);
                }
                // this._lastLsn = lsn;
            });
            const options = [
                `proto_version '1'`,
                `publication_names 'alltables'`,
            ];
            const sql = `START_REPLICATION SLOT "pruebas" LOGICAL ${'0/00000000'} (${options.join(', ')})`;
            console.log('sql', sql);
            return this._client.query(sql);
        }
        catch (error) {
            console.log('error', error);
        }
    }
    get query() {
        return this._client.query;
    }
}
exports.PgClient = PgClient;
