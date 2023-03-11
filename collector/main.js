/**
 * Metrics Collector for Cube.dev
 */

import { WebSocketServer } from 'ws'
import pg from 'pg'
import {inflate} from 'pako'
import process from 'process'
import jwt from 'jsonwebtoken'

const DB_URL = 'postgres://user:pass@db/metrics'
const PORT = 5000
const MAX_MSGS = 1000;

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
 
const pool = new pg.Pool({
    connectionString: DB_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

function heartbeat() {
    this.isAlive = true;
}
  
async function main() {
    console.info('Starting collector')

    const token = jwt.sign({}, process.env.CUBEJS_API_SECRET, { expiresIn: '30d' })
    console.log('JWT TOKEN', token)
    
    const db = await pool.connect()
    
    console.info('DB Setup')
    for(let stmt of DB_SETUP) {
        await db.query(stmt)
    }
    db.release()

    console.info('WebSocket Setup')
    const wss = new WebSocketServer({ port: PORT, backlog: 10, });
    wss.on('connection', onConnect)

    setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
          if (ws.isAlive === false) {
            console.log("NOT ALIVE", ws._socket.address())
            return ws.terminate();
          }
          ws.isAlive = false;
          ws.ping();
        });
      }, 30000);

    process.on('SIGTERM', sig => {
        console.error(sig);
        stop(0);
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
    'Load PreAggregations Tables',
    'Refreshing pre-aggregation content',
]

// TODO: add authentication
async function onMessage(raw, ws) {
    let text = await report(inflate, raw, { to: 'string' })
    let data = JSON.parse(text)
    
    ws.count += 1;

    if(data.method !== 'agent') {
        console.warn('unknown packet', data)
        return
    }

    for(let event of data.params.data) {
        let { id, timestamp, msg } = event
        
        if(IGNORED.includes(msg)) {
            continue;
        }

        const db = await pool.connect() 
        await db.query('BEGIN')

        if(msg === 'Query completed') {
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
            console.log('unknown event', event.msg)
        }
        
        await db.query('COMMIT')
        db.release()
    }

    ws.send(JSON.stringify({
        method: 'callback',
        params: {
            callbackId: data.callbackId,
            result: null,
        }
    }))

    if(ws.count > MAX_MSGS) {
        console.log("MAX_MSGS", ws._socket.address());
        ws.terminate();
    }
}

function onConnect(ws) {
    console.info('connected', ws._socket.address())
  
    ws.isAlive = true;
    ws.count = 0;

    ws.on('pong', heartbeat);
  
    ws.on('error', err => {
        console.log("WS-ERR", err)
        stop(1)
    })
    ws.on('message', raw => report(onMessage, raw, ws))
}

async function stop(code) {
    console.error('Stopping')
    await db.end()
    process.exit(code)
}

async function report(func, ...args) {
    try {
        return await func(...args)
    } catch(e) {
        console.error("CAUGHT ERROR", e, {func})
        stop(1)
    }
}

await report(main);
