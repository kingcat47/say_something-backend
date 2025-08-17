
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class ImageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientReadPorts = new Map<string, string>();
    clientNames = new Map<string, string>();

    handleConnection(client: Socket) {
        const randomName = faker.person.fullName();
        this.clientNames.set(client.id, randomName);
        this.clientReadPorts.set(client.id, '');
        console.log(`[ImageGateway] Client connected: ${client.id}, nickname: ${randomName}`);
    }

    handleDisconnect(client: Socket) {
        this.clientReadPorts.delete(client.id);
        this.clientNames.delete(client.id);
        console.log(`[ImageGateway] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('setReadPort')
    setReadPort(
        @MessageBody() data: { read_port?: string; readPort?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const value = String(data.read_port || data.readPort || '').trim();
        this.clientReadPorts.set(client.id, value);
        console.log(`[ImageGateway] Client ${client.id} set read port to: ${value || '(all ports)'}`);
    }

    @SubscribeMessage('sendImage')
    handleSendImage(
        @MessageBody() data: { port?: string; url: string },
        @ConnectedSocket() sender: Socket,
    ) {
        const port = String(data.port || '').trim();
        const imageUrl = data.url;
        const senderName = this.clientNames.get(sender.id) || '익명';

        console.log(`[ImageGateway] Sending image from ${senderName} (socket ${sender.id}) on port ${port}`);

        this.sendToClients(port, imageUrl, senderName);
    }

    sendToClients(port: string, imageUrl: string, name?: string) {
        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if (!clientSocket) continue;

            if (readPort === '/admin_mode') {
                console.log('aaa', name)
                clientSocket.emit('image', { port, url: imageUrl, senderName: name });
            } else if (readPort === '' && port === '') {
                console.log('aaa', name)
                clientSocket.emit('image', { port, url: imageUrl, senderName: name });
            } else if (readPort !== '' && readPort === port) {
                console.log('aaa', name)
                clientSocket.emit('image', { port, url: imageUrl, senderName: name });
            }
        }
    }
}
