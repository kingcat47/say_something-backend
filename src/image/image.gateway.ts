import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: '*' } })
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

    @SubscribeMessage('sendImage')
    handleImage(
        @MessageBody() data: { port: string; file: string },
        @ConnectedSocket() sender: Socket,
    ) {
        const sendPort = String(data.port || '');
        const base64Image = data.file; // base64 문자열로 받음

        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            console.log('이미지 보냈습니다. 서버왈')
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if (!clientSocket) continue;

            if (readPort === '' || readPort === sendPort) {
                clientSocket.emit('image', { port: sendPort, file: base64Image });
            }
        }
    }
}