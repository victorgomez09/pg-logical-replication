const { io } = require("socket.io-client");
const { createPgClient } = require('../dist/index');

const PUBLICATION_NAME = 'alltables'

const client = createPgClient({
    db: 'test_with_replication',
    username: 'postgres',
    password: 'postgres',
    publications: PUBLICATION_NAME
}, {
  port: 3000,
  trace: "trace"
});

client.subscribeChanges('slot_pg');

const socket = io("https://shiny-yodel-rrvj4r5gvw42xgq7-3000.app.github.dev");

socket.on("connect", () => {
    console.log(socket.connected); // true
});

socket.on("changes", (data) => {
    console.log("changes", data)
})

// const {LogicalReplicationService} = require('../dist/pg-client')
// const {PgoutputPlugin } = require('../dist/pg/pgoutput/index')

// const service = new LogicalReplicationService(
//     /**
//      * node-postgres Client options for connection
//      * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pg/index.d.ts#L16
//      */
//     {
//       database: 'test_with_replication',
//       user: 'postgres',
//       password: 'postgres',
//       port: '5432'
//       // ...
//     },
//     /**
//      * Logical replication service config
//      * https://github.com/kibae/pg-logical-replication/blob/main/src/logical-replication-service.ts#L9
//      */
//     {
//       acknowledge: {
//         auto: true,
//         timeoutSeconds: 10
//       }
//     }
//   )

//   service.subscribe(new PgoutputPlugin({
//     protoVersion: 1,
//     publicationNames: ['alltables']
//   }), 'slot_pg')
//     .catch((e) => {
//       console.error(e);
//     })
//     .then(() => {
//       console.log('inside then')
//     });

//     service.on("data", (lsn, log) => {
//         console.log('lsn', lsn)
//         console.log('log', log)
//     })