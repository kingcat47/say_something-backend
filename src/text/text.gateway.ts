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

    // 클라이언트 ID → 읽을 포트 번호 저장
    private clientReadPorts = new Map<string, string>();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        this.clientReadPorts.set(client.id, '');
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.clientReadPorts.delete(client.id);
    }

    // 클라이언트에서 필터 포트 지정
    @SubscribeMessage('setReadPort')
    setReadPort(
        @MessageBody() data: { read_port: string }, // snake_case로 받기
        @ConnectedSocket() client: Socket,
    ) {
        const portValue = data.read_port || '';
        this.clientReadPorts.set(client.id, portValue);
        console.log(`Client ${client.id} set read_port to '${portValue}'`);
    }

    // 메시지 전송 -> 읽을 포트와 매칭되는 클라이언트에게만 보냄
    @SubscribeMessage('sendMessage')
    handleMessage(
        @MessageBody() data: { port: string; text: string },
        @ConnectedSocket() sender: Socket,
    ) {
        const { port, text } = data;

        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if (!clientSocket) continue;

            if (readPort === '' || readPort === port) {
                clientSocket.emit('message', { port, text });
            }
        }
    }
}
