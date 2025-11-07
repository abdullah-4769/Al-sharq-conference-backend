import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SessionForumService } from './session-forum.service';
import { CreateSessionForumDto } from './dto/create-session-forum.dto';
import { UpdateSessionForumDto } from './dto/update-session-forum.dto';

@Controller('session-forums')
export class SessionForumController {
  constructor(private readonly forumService: SessionForumService) {}

  @Post()
  create(@Body() createForumDto: CreateSessionForumDto) {
    return this.forumService.create(createForumDto);
  }

  @Get()
  findAll() {
    return this.forumService.findAll();
  }

  @Get('session/:id')
  async getBySession(@Param('id') id: string) {
    return this.forumService.findBySession(+id);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateForumDto: UpdateSessionForumDto) {
    return this.forumService.update(+id, updateForumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.forumService.remove(+id);
  }

@Patch('status/:id')
changeStatus(
  @Param('id') id: string,
  @Body('status') status: 'APPROVED' | 'REJECTED'
) {
  return this.forumService.changeStatus(+id, status);
}



}
