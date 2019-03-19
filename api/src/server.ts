#!/usr/bin/env node

import debug from 'debug';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { MongoClient, MongoError } from 'mongodb';
import * as SocketIO from 'socket.io';

import { app } from './app';
import { connect } from './db';

const logger = debug('the-best-button-api:server');

const port: string | number | false = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server: Server = createServer(app);
const io: SocketIO.Server = SocketIO(server);

(async () => {
    try {
        const client: MongoClient = await connect((error: MongoError) => {
            throw new Error(`Mongo Error${error.code ? ` [${error.code}]` : ''} \n ${error.stack}`);
        });

        io.on('connection', (socket: SocketIO.Socket) => socket.on('vote', (color: string) => socket.broadcast.emit('vote', color)));
        server.listen(port).on('error', onError).on('listening', onListening).on('close', client.close);
    } catch (error) {
        console.error(error);
    }
})();

function normalizePort(val: string): string | number | false {
    const value = parseInt(val, 10);

    if (isNaN(value)) { return val; }
    if (value >= 0) { return value; }

    return false;
}

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind: string = typeof port === 'string' ? `'Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    const addr: string | AddressInfo = server.address();
    const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    logger(`Listening on ${bind}`);
}
