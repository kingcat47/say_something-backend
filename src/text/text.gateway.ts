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
        console.log(`Client ${client.id} set read_port to '${value}'`);
    }

    @SubscribeMessage('sendMessage')
    handleMessage(
        @MessageBody() data: { port?: string; text: string },
        @ConnectedSocket() sender: Socket,
    ) {
        const port = String(data.port || '').trim();
        const text = data.text;
        console.log('디버깅용임. text 보내기 콘솔');
        for (const [clientId, readPort] of this.clientReadPorts.entries()) {
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if (!clientSocket) continue;

            // admin_mode면 모든 메시지 전달
            if (readPort === '/admin_mode') {
                clientSocket.emit('message', { port, text });
            }
            // readPort가 빈값이면 port도 빈값인 메시지만 전달
            else if (readPort === '' && port === '') {
                clientSocket.emit('message', { port, text });
            }
            // 그 밖에는 readPort와 port 값이 같을 때만 전달
            else if (readPort !== '' && readPort === port) {
                clientSocket.emit('message', { port, text });
            }
            // 나머지 경우에는 전달 안 함
        }
    }

}
