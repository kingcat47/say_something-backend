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
import { UserNameService } from '../share/user-name.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GifGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientReadPorts = new Map<string, string>();

    constructor(private readonly userNameService: UserNameService) {}

    handleConnection(client: Socket) {
        const randomName = this.userNameService.getOrCreateName(client.id);
        this.clientReadPorts.set(client.id, '');
        console.log(`[GifGateway] Client connected: ${client.id}, nickname: ${randomName}`);
    }

    handleDisconnect(client: Socket) {
        this.clientReadPorts.delete(client.id);
        this.userNameService.deleteName(client.id);
        console.log(`[GifGateway] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('setReadPort')
    setReadPort(
        @MessageBody() data: { read_port?: string; readPort?: string },
        @ConnectedSocket() client: Socket,
    ) {
        const value = String(data.read_port || data.readPort || '').trim();
        this.clientReadPorts.set(client.id, value);
        console.log(`[GifGateway] Client ${client.id} set read_port to '${value}'`);
    }

    @SubscribeMessage('sendGif')
    handleGif(
        @MessageBody() data: { port?: string; gifUrl: string },
        @ConnectedSocket() sender: Socket,
    ) {
        const port = String(data.port || '').trim();
        const gifUrl = data.gifUrl;
        const senderName = this.userNameService.getName(sender.id) || '익명';

        console.log(`[GifGateway] Sending GIF from ${senderName} (socket ${sender.id}) on port ${port}`);

        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if (!clientSocket) continue;

            if (readPort === '/admin_mode') {
                console.log('[GifGateway] Sending Gif');
                clientSocket.emit('gif', { port, gifUrl, senderName });
            } else if (readPort === '' && port === '') {
                console.log('[GifGateway] Sending Gif');
                clientSocket.emit('gif', { port, gifUrl, senderName });
            } else if (readPort !== '' && readPort === port) {
                console.log('[GifGateway] Sending Gif');
                clientSocket.emit('gif', { port, gifUrl, senderName });
            }
        }
    }
}
