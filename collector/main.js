/**
 * Metrics Collector for Cube.dev
 */

import { WebSocketServer } from 'ws'
import pg from 'pg'
import {inflate} from 'pako'
import process from 'process'

const DB_URL = 'postgres://user:pass@db/metrics'
const PORT = 5000

const DB_SETUP = [
`CREATE TABLE IF NOT EXISTS queries(
    id CHAR(32) PRIMARY KEY,
    created TIMESTAMP NOT NULL,
    query TEXT NOT NULL,
    duration FLOAT NOT NULL
)`,
`CREATE INDEX IF NOT EXISTS queries_duration ON queries(duration DESC)`,
`CREATE INDEX IF NOT EXISTS queries_created ON queries(created)`,

`CREATE TABLE IF NOT EXISTS requests(
    id CHAR(32) PRIMARY KEY,
    created TIMESTAMP NOT NULL
)`,
`CREATE INDEX IF NOT EXISTS requests_created ON requests(created)`,
]

const db = new pg.Client({ connectionString: DB_URL })

async function main() {
    console.info('Starting collector')

    await db.connect()

    console.info('DB Setup')
    for(let stmt of DB_SETUP) {
        await db.query(stmt)
    }

    //const res = await db.query('SELECT $1::text as message', ['Hello world!'])
    //console.log(res.rows[0].message) // Hello world!

    console.info('WebSocket Setup')
    const wss = new WebSocketServer({ port: PORT });
    wss.on('connection', onConnect)

    process.on('SIGTERM', sig => {
        console.error(sig);
        stop();
    });
}

const IGNORED = [
    'Incoming network usage',
    'Load Request',
    'Load Request SQL',
    'Query started', // query
    'Found cache entry',
    'Using cache for',
    'Waiting for renew',
    'Added to queue',
    'Executing SQL', // queryKey
    'Performing query', // queryKey
    'Waiting for query', // queryKey
    'Skip processing', 
    'Skipping free processing lock',
    'Performing query completed',
    'Renewed',
    'Outgoing network usage',
    'Load Request Success',
    'Dropping orphaned tables completed',
    'Dropping orphaned tables',
    'Uploading external pre-aggregation completed',
    'Uploading external pre-aggregation',
    'Downloading external pre-aggregation via query completed',
    'Downloading external pre-aggregation via query',
    'Found in memory cache entry',
    'Waiting for pre-aggregation renew',
    'Renewing existing key',
    'Executing Load Pre Aggregation SQL',
    'Refresh Scheduler Run',
]

// TODO: add authentication
async function onMessage(raw, ws) {
    let text = inflate(raw, { to: 'string' })
    let data = JSON.parse(text)
    
    if(data.method !== 'agent') {
        console.warn('unknown packet', data)
        return
    }

    for(let event of data.params.data) {
        let { id, timestamp, msg } = event
        
        if(IGNORED.includes(msg)) {
            continue;
        } else if(msg === 'Query completed') {
            if(event.query) {
                await db.query(`
                    INSERT INTO queries(id, created, duration, query)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (id) DO NOTHING
                `, [id, timestamp, event.duration, event.query])
            }
        } else if(msg === 'REST API Request') {
            await db.query(`
                INSERT INTO requests(id, created)
                VALUES ($1, $2)
                ON CONFLICT (id) DO NOTHING
            `, [id, timestamp])
        } else {
            console.log('unknown event', event)
        }
    }

    ws.send(JSON.stringify({
        method: 'callback',
        params: {
            callbackId: data.callbackId,
            result: null,
        }
    }))
}

function onConnect(ws) {
    console.info('connected', ws._socket.address())

    ws.on('error', stop)
    ws.on('message', raw => onMessage(raw, ws))
}

async function stop() {
    console.error('Stopping')
    await db.end()
    process.exit(0);
}

await main();
