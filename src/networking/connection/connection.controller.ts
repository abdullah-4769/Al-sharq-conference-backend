import { Controller, Post, Body, Param, ParseIntPipe,Delete, Patch, Get, Query } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { SendConnectionRequestDto, UpdateConnectionStatusDto } from './dto/connection.dto';

@Controller('connections')
export class ConnectionController {
  constructor(private service: ConnectionService) {}


  @Post('send')
  async sendRequest(@Body() dto: SendConnectionRequestDto) {
    return this.service.sendRequest(dto);
  }


  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConnectionStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }


  @Get('sent')
  async getSentRequests(@Query('senderId', ParseIntPipe) senderId: number) {
    return this.service.getSentRequests(senderId);
  }

  @Get('received')
  async getReceivedRequests(@Query('receiverId', ParseIntPipe) receiverId: number) {
    return this.service.getReceivedRequests(receiverId);
  }

// GET /connections/all?userId=1
@Get('all')
async getAllConnections(@Query('userId', ParseIntPipe) userId: number) {
  return this.service.getAllConnections(userId);
}


 @Get('pending')
  async getPendingRequests(@Query('userId', ParseIntPipe) userId: number) {
    return this.service.getPendingRequests(userId);
  }


   @Delete('clear')
  async deleteAllRequests() {
    return this.service.deleteAllRequests();
  }



  
}
