import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { Speaker } from '@prisma/client';

@Controller('speakers')
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Post()
  create(@Body() data: Omit<Speaker, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.speakerService.create(data);
  }

  @Get()
  findAll() {
    return this.speakerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speakerService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Speaker>) {
    return this.speakerService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speakerService.remove(Number(id));
  }

 @Get('event/:eventId/short-info')
  findSpeakersByEvent(@Param('eventId') eventId: string) {
    return this.speakerService.findSpeakersByEvent(Number(eventId));
  }


}
