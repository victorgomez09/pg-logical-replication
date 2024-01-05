const { createPgClient } = require('../dist/index')

const PUBLICATION_NAME = 'alltables'

const client = createPgClient({
    db: 'test_with_replication',
    username: 'postgres',
    password: 'postgres',
    publications: PUBLICATION_NAME
});

client.subscribeChanges();