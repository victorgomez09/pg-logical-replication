import { ClientConfig } from 'pg';
import { LogicalReplicationConfig, LogicalReplicationService } from './logical-replication-service';

export * from './logical-replication-service';

export * from './output-plugins/test_decoding/test-decoding-plugin';

export * from './output-plugins/pgoutput';

export * from './output-plugins/wal2json/wal2json-plugin';
export * from './output-plugins/wal2json/wal2json-plugin-options.type';
export * from './output-plugins/wal2json/wal2json-plugin-output.type';

export * from './output-plugins/decoderbufs/decoderbufs-plugin';
export * from './output-plugins/decoderbufs/decoderbufs-plugin-output.type';


export const createPgClient = (clientConfig: ClientConfig, config?: Partial<LogicalReplicationConfig>) =>  {
    return new LogicalReplicationService(clientConfig, config);
}