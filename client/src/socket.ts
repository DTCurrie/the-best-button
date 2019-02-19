import SocketIOClient from 'socket.io-client';

import { url } from './api';

const socket: SocketIOClient.Socket = SocketIOClient(url);

export function emit<T>(event: string, data: T, callback: () => void): void {
    socket.emit(event, data);
    callback();
}

export function listen<T>(event: string, handler: (data: T) => void): void { socket.on(event, handler); }
