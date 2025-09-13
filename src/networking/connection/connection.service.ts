import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { SendConnectionRequestDto, UpdateConnectionStatusDto } from './dto/connection.dto';

@Injectable()
export class ConnectionService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(dto: SendConnectionRequestDto) {
    const { senderId, receiverId } = dto;

    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send a request to yourself');
    }

    const existing = await this.prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'PENDING') {
        throw new BadRequestException('Request already pending');
      }
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('You are already connected');
      }
      if (existing.status === 'REJECTED') {
        throw new BadRequestException('Request was rejected');
      }
    }

    return this.prisma.connectionRequest.create({
      data: { senderId, receiverId },
    });
  }

  async updateStatus(requestId: number, dto: UpdateConnectionStatusDto) {
    const request = await this.prisma.connectionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    return this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: dto.status },
    });
  }

  async getSentRequests(senderId: number) {
    return this.prisma.connectionRequest.findMany({
      where: { senderId },
      include: { receiver: true },
    });
  }

  async getReceivedRequests(receiverId: number) {
    return this.prisma.connectionRequest.findMany({
      where: { receiverId },
      include: { sender: true },
    });
  }


async getAllConnections(userId: number) {
  const connections = await this.prisma.connectionRequest.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    include: {
      sender: true,
      receiver: true,
    },
  });

  // Transform so we always show the "other user" as the connection
  return connections.map(c => {
    const otherUser = c.senderId === userId ? c.receiver : c.sender;
    return {
      connectionId: c.id,
      user: {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email,
        file: otherUser.file,
      },
      connectedAt: c.updatedAt,
    };
  });
}



}
