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

interface ImageChunkData {
    port: string;
    fileChunk: string;
    isLastChunk: boolean;
    chunkIndex: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ImageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientReadPorts = new Map<string, string>();
    private imageBuffers = new Map<string, { chunks: string[]; port: string }>();

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
        @MessageBody() data: ImageChunkData,
        @ConnectedSocket() sender: Socket,
    ) {
        const sendPort = String(data.port || '');
        const chunkKey = `${sender.id}_${sendPort}`;


        if (!this.imageBuffers.has(chunkKey)) {
            this.imageBuffers.set(chunkKey, { chunks: [], port: sendPort });
        }

        const bufferData = this.imageBuffers.get(chunkKey)!; // 여기서 undefined 아님을 명시
        bufferData.chunks[data.chunkIndex] = data.fileChunk;

        if (data.isLastChunk) {
            // 모든 Chunk 합쳐서 브로드캐스트
            const fullBase64 = bufferData.chunks.join('');

            for (const [clientId, readPort] of this.clientReadPorts.entries()) {
                const clientSocket = this.server.sockets.sockets.get(clientId);
                if (!clientSocket) continue;

                if (readPort === '' || readPort === sendPort) {
                    clientSocket.emit('image', { port: sendPort, file: fullBase64 });
                }
            }


            this.imageBuffers.delete(chunkKey);
        }
    }
}
