"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgoutputPlugin = void 0;
const abstract_plugin_1 = require("../abstract.plugin");
const pgoutput_parser_1 = require("./pgoutput-parser");
class PgoutputPlugin extends abstract_plugin_1.AbstractPlugin {
    constructor(options) {
        super(options);
        this.parser = new pgoutput_parser_1.PgoutputParser();
    }
    get name() {
        return 'pgoutput';
    }
    parse(buffer) {
        return this.parser.parse(buffer);
    }
    start(client, slotName, lastLsn) {
        const options = [
            `proto_version '${this.options.protoVersion}'`,
            `publication_names '${this.options.publicationNames.join(',')}'`,
        ];
        const sql = `START_REPLICATION SLOT "${slotName}" LOGICAL ${lastLsn} (${options.join(', ')})`;
        return client.query(sql);
    }
}
exports.PgoutputPlugin = PgoutputPlugin;
