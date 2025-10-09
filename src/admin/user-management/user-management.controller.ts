import { Controller, Get, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common'
import { UserManagementService } from './user-management.service'
import { UpdateBlockDto } from './dto/update-block.dto'

@Controller('admin/users')
export class UserManagementController {
  constructor(private userService: UserManagementService) {}

  @Get('participants')
  async getParticipants() {
    return this.userService.getAllParticipants()
  }

  @Patch('block')
  async blockParticipant(@Body() updateBlockDto: UpdateBlockDto) {
    return this.userService.blockUnblockParticipant(updateBlockDto)
  }

  @Delete(':id')
  async deleteParticipant(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteParticipant(id)
  }

  @Get('dashboard')
  async getDashboard() {
    return this.userService.getDashboardSummary();
  }



    @Get('weekly-attendance')
  async getWeeklyAttendance() {
    return this.userService.getWeeklyAttendance();
  }

}
