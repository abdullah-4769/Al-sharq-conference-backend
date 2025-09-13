import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}


  async sendMessage(senderId: number, receiverId: number, content: string) {

    const connection = await this.prisma.connectionRequest.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (!connection) {
      throw new BadRequestException('You are not connected with this user');
    }

    return this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
  }

async getMessages(userId: number, otherUserId: number) {
  const messages = await this.prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, file: true } },
      receiver: { select: { id: true, name: true, file: true } },
    },
  });

  if (messages.length === 0) return null;

  return {
    sender: messages[0].sender,
    receiver: messages[0].receiver,
    messages: messages.map(m => ({
      id: m.id,
      from: m.senderId === userId ? "sender" : "receiver", 
      content: m.content,
      createdAt: m.createdAt,
    })),
  };
}


}
