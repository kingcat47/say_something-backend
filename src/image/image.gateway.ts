import {
    ConnectedSocket, MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";

@WebSocketGateway({cors:{origin:'*'}})
export class ImageGateway implements OnGatewayConnection, OnGatewayConnection{
    @WebSocketServer()
    server: Server;

    private clientReadPorts = new Map<string,string>;

    handleConnection(client: Socket){
        console.log(`Client connected: ${client.id}`);
        this.clientReadPorts.set(client.id,'');
    }

    handleDisconnect(client: Socket){
        console.log(`Client disconnected: ${client.id}`);
        this.clientReadPorts.delete(client.id);
    }

    @SubscribeMessage('setReadPort')
    setReadPort(
        @MessageBody() data:{ read_port?:string; readPort?:string },
        @ConnectedSocket() client: Socket,
    ){
        const value = String(data.read_port || data.readPort || '').trim();
        this.clientReadPorts.set(client.id, value);
        console.log(`Client connected: ${client.id}`);
    }


    @SubscribeMessage('sendImage')
    handleImage(
        @MessageBody() data: any,
        @ConnectedSocket() sender: Socket,
    ){
        const port = this.clientReadPorts.get(sender.id);

        for(const [clientId,readPort] of this.clientReadPorts.entries()){
            const clientSocket = this.server.sockets.sockets.get(clientId);
            if(!clientSocket) continue;

            // 클라이언트가 읽을 포트가 설정되어 있거나, 현재 포트와 일치하는 경우
            if(readPort === '' || readPort === port){
                clientSocket.emit('image',data);
            }
        }
    }
}