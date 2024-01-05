const {createPostgresClient} = require('../dist/index')

const PUBLICATION_NAME = 'alltables'

const client = createPostgresClient({
    db: 'test_with_replication',
    username: 'postgres',
    password: 'postgres',
    publications: PUBLICATION_NAME
});

(async () => {
    const user = await client.sql`INSERT INTO accounts2(username, password) VALUES('admin2', 'admin2') returning *`;
    console.log('user', user)

    process.exit(1)
})()