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
import { TextGateway } from '../text/text.gateway';
import { faker } from '@faker-js/faker';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ImageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientReadPorts = new Map<string, string>();

    constructor(private textGateway: TextGateway) {}

    handleConnection(client: Socket) {
        // TextGateway의 clientNames와 동일하게 랜덤 이름 생성
        const randomName = faker.person.fullName();
        this.textGateway.clientNames.set(client.id, randomName);
        this.clientReadPorts.set(client.id, '');
        console.log(`[ImageGateway] Client connected: ${client.id}, nickname: ${randomName}`);
    }

    handleDisconnect(client: Socket) {
        this.clientReadPorts.delete(client.id);
        this.textGateway.clientNames.delete(client.id);
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
        const senderName = this.textGateway.clientNames.get(sender.id) || '익명';

        console.log(`[ImageGateway] Sending image from ${senderName} (socket ${sender.id}) on port ${port}`);

        this.sendToClients(port, imageUrl, senderName);
    }

    sendToClients(port: string, imageUrl: string, senderName?: string) {
        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if (!clientSocket) continue;

            if (readPort === '/admin_mode' || (readPort === '' && port === '') || readPort === port) {
                clientSocket.emit('image', { port, url: imageUrl, senderName });
            }
        }
    }
}
