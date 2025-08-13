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
    fileChunk: ArrayBuffer; // 변경: string -> ArrayBuffer
    isLastChunk: boolean;
    chunkIndex: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ImageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientReadPorts = new Map<string, string>();
    private imageBuffers = new Map<string, { chunks: ArrayBuffer[]; port: string }>();

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

        const bufferData = this.imageBuffers.get(chunkKey)!;
        bufferData.chunks[data.chunkIndex] = data.fileChunk;

        if (data.isLastChunk) {
            // 모든 ArrayBuffer 합치기
            const totalLength = bufferData.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
            const merged = new Uint8Array(totalLength);
            let offset = 0;

            for (const chunk of bufferData.chunks) {
                merged.set(new Uint8Array(chunk), offset);
                offset += chunk.byteLength;
            }

            // 필요하면 base64로 변환 후 클라이언트에 보내기
            const fullBase64 = Buffer.from(merged).toString('base64');

            for (const [clientId, readPort] of this.clientReadPorts.entries()) {
                const clientSocket = this.server.sockets.sockets.get(clientId);
                if (!clientSocket) continue;

                if (readPort === '' || readPort === sendPort) {
                    console.log('이미지 브로드캐스트 중...');
                    clientSocket.emit('image', { port: sendPort, file: fullBase64 });
                }
            }

            this.imageBuffers.delete(chunkKey);
        }
    }
}
