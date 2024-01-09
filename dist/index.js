"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPgClient = exports.createPostgresClient = void 0;
const pg_client_1 = require("./pg-client");
const postgres_client_1 = require("./postgres-client");
const createPostgresClient = (options, socketOptions) => {
    return new postgres_client_1.PostgresJsClient(options, socketOptions);
};
exports.createPostgresClient = createPostgresClient;
const createPgClient = (options, socketOptions) => {
    return new pg_client_1.PgClient(options, socketOptions);
};
exports.createPgClient = createPgClient;
