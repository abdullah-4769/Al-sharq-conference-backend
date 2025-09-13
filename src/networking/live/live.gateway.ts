import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LiveService } from './live.service';
import { JoinSessionDto } from './dto/join-session.dto';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class LiveGateway {
  @WebSocketServer()
  server: Server;

  constructor(private liveService: LiveService) {}

  @SubscribeMessage('joinSession')
  handleJoin(
    @MessageBody() data: JoinSessionDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.liveService.addParticipant(data.sessionId, data.userId, client.id);
    client.join(data.sessionId);
    // Notify others
    client.to(data.sessionId).emit('participantJoined', data.userId);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: MessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.sessionId).emit('receiveMessage', data);
  }

  @SubscribeMessage('leaveSession')
  handleLeave(
    @MessageBody() data: JoinSessionDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.sessionId);
    this.liveService.removeParticipant(data.sessionId, data.userId);
    client.to(data.sessionId).emit('participantLeft', data.userId);
  }
}
