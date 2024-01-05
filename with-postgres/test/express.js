const express = require('express')
const { io } = require("socket.io-client");
const {createPostgresClient} = require('../dist/index')

const app = express()

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

socket.on("changes", (data) => {
    console.log("changes", data)
})

app.use("/", (req, res) => {
    res.send('init')
})

app.listen(5000, () => console.log('express running on port 5000'))