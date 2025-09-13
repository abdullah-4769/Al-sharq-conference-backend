import { Controller, Post, Body, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private service: ChatService) {}


  @Post('send')
  async sendMessage(
    @Body('senderId', ParseIntPipe) senderId: number,
    @Body('receiverId', ParseIntPipe) receiverId: number,
    @Body('content') content: string,
  ) {
    return this.service.sendMessage(senderId, receiverId, content);
  }


  @Get('messages')
  async getMessages(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('otherUserId', ParseIntPipe) otherUserId: number,
  ) {
    return this.service.getMessages(userId, otherUserId);
  }
}
