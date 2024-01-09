const { io } = require("socket.io-client");
const {createPostgresClient} = require('../dist/index')

const PUBLICATION_NAME = 'alltables'

const client = createPostgresClient({
    db: 'test_with_replication',
    username: 'postgres',
    password: 'postgres',
    publications: PUBLICATION_NAME
}, {
    port: 3000,
    trace: "trace"
});

client.subscribeChanges('*');


const socket = io("https://shiny-yodel-rrvj4r5gvw42xgq7-3000.app.github.dev");

socket.on("connect", () => {
    console.log(socket.connected); // true
});

socket.on("changes", (data) => {
    console.log("changes", data)
})

module.exports = {client}