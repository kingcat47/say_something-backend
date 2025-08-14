import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class ImageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientReadPorts = new Map<string, string>();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        this.clientReadPorts.set(client.id, '');
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.clientReadPorts.delete(client.id);
    }

    @SubscribeMessage('setReadPort')
    setReadPort(
        @MessageBody() data: { read_port?: string; readPort?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const value = String(data.read_port || data.readPort || '').trim();
        this.clientReadPorts.set(client.id, value);
        console.log(`Client ${client.id} set read port to: ${value || '(all ports)'}`);
    }

    sendToClients(port: string, imageUrl: string) {
        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            const clientSocket = this.server.sockets.sockets.get(clientId);
            console.log('보내는중')
            if (!clientSocket) continue;

            if (readPort === '' || readPort === port) {
                clientSocket.emit('image', { port, file: imageUrl });
            }
        }
    }
}
