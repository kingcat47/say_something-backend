import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class TextGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    clientReadPorts = new Map<string, string>();
    clientNames = new Map<string, string>();

    handleConnection(client: Socket) {
        const randomName = faker.person.fullName();
        this.clientNames.set(client.id, randomName);
        this.clientReadPorts.set(client.id, '');
        console.log(`[TextGateway] Client connected: ${client.id}, nickname: ${randomName}`);
    }

    handleDisconnect(client: Socket) {
        this.clientNames.delete(client.id);
        this.clientReadPorts.delete(client.id);
        console.log(`[TextGateway] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('setReadPort')
    setReadPort(
        @MessageBody() data: { read_port?: string; readPort?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const value = String(data.read_port || data.readPort || '').trim();
        this.clientReadPorts.set(client.id, value);
        console.log(`[TextGateway] Client ${client.id} set read_port to '${value}'`);
    }

    @SubscribeMessage('sendMessage')
    handleMessage(
        @MessageBody() data: { port?: string; text: string },
        @ConnectedSocket() sender: Socket,
    ) {
        const port = String(data.port || '').trim();
        const text = data.text;
        const senderName = this.clientNames.get(sender.id) || '익명';

        console.log(`[TextGateway] Sending message from ${senderName} (socket ${sender.id}) on port ${port}`);

        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if (!clientSocket) continue;

            if (readPort === '/admin_mode' || (readPort === '' && port === '') || readPort === port) {
                clientSocket.emit('message', { port, text, senderName });
            }
        }
    }
}
