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


@WebSocketGateway({ cors: { origin: '*' } })
export class TextGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientReadPorts: Map<string, string> = new Map();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        this.clientReadPorts.set(client.id, "");
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.clientReadPorts.delete(client.id);
    }


    @SubscribeMessage('setReadPort')
    setReadPort(
        @MessageBody() data: { read_port: string },
        @ConnectedSocket() client: Socket,
    ) {
        this.clientReadPorts.set(client.id, data.read_port || "");
        console.log(
            `Client ${client.id} set read_port to '${data.read_port || ''}'`,
        );
    }

    @SubscribeMessage('sendMessage')
    handleMessage(
        @MessageBody() data: { port: string; text: string },
        @ConnectedSocket() sender: Socket,
    ) {
        const { port, text } = data;

        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if (!clientSocket) continue; // 연결이 끊긴 경우 건너뜀

            if (readPort === "" || readPort === port) {
                clientSocket.emit('message', { port, text });
            }
        }
    }
}
