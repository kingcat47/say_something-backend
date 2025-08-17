
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

@WebSocketGateway({ cors: { origin: '*' } })
export class TextGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientReadPorts = new Map<string, string>();
    private clientNames = new Map<string, string>();

    handleConnection(client: Socket) {
        const randomName = faker.person.fullName();  // 랜덤 이름 생성
        this.clientNames.set(client.id, randomName);
        this.clientReadPorts.set(client.id, '');
        console.log(`[TextGateway] Client connected: ${client.id}, nickname: ${randomName}`);
    }

    handleDisconnect(client: Socket) {
        this.clientReadPorts.delete(client.id);
        this.clientNames.delete(client.id);
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

            // admin_mode면 모든 메시지 전달
            if (readPort === '/admin_mode') {
                console.log('aaa', senderName)
                clientSocket.emit('message', { port, text, senderName });
            }
            // readPort가 빈값이면 port도 빈값인 메시지만 전달
            else if (readPort === '' && port === '') {
                console.log('aaa', senderName)
                clientSocket.emit('message', { port, text, senderName });
            }
            // 그 밖에는 readPort와 port 값이 같을 때만 전달
            else if (readPort !== '' && readPort === port) {
                console.log('aaa', senderName)
                clientSocket.emit('message', { port, text, senderName });
            }
            // 나머지 경우에는 전달 안 함
        }
    }
}
