/**
 * Metrics Collector for Cube.dev
 */

import WebSocket from 'ws'
import pg from 'pg'

const DB_URL = 'postgres://user:pass@db/metrics'
const PORT = 5000

const db = new pg.Client()

async function main() {
    console.info('Starting collector')

    await db.connect({ connectionString: DB_URL })
 
    const res = await db.query('SELECT $1::text as message', ['Hello world!'])
    console.log(res.rows[0].message) // Hello world!

    const wss = new WebSocketServer({ port: PORT });
    wss.on('connection', onConnect)
}

function onConnect(ws) {
    ws.on('error', stop);

    // TODO: add authentication
    ws.on('message', data => {
        console.log('received: %s', data);
    });

    ws.send('something');
}

async function stop() {
    await client.end()
}

if (require.main === module) {
    await main();
}
