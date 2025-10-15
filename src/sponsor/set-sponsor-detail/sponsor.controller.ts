import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { SponsorService } from './sponsor.service';
import { FileInterceptor } from '@nestjs/platform-express'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Controller('sponsors')
export class SponsorController {
  constructor(private readonly sponsorService: SponsorService) {}

  @Post()
  create(@Body() dto: CreateSponsorDto) {
    return this.sponsorService.createSponsor(dto)
  }

  @Get()
  findAll() {
    return this.sponsorService.getAllSponsors()
  }
  

  @Get('event/short-info')
async getShortInfo() {
  return this.sponsorService.getSponsorsShortInfo()
}
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sponsorService.getSponsorById(id)
  }


 @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSponsorDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.sponsorService.updateSponsor(id, dto, file)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sponsorService.deleteSponsor(id)
  }

  @Get(':id/details')
  getDetails(@Param('id', ParseIntPipe) id: number) {
    return this.sponsorService.getSponsorWithDetails(id)
  }

@Get('sponsor/:id/sessions')
async getSessionsBySponsor(@Param('id') sponsorId: string) {
  return this.sponsorService.findSessionsBySponsor(parseInt(sponsorId, 10))
}
  

@Patch(':id/reset-password')
async resetPassword(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: ResetPasswordDto,
) {
  return this.sponsorService.resetPassword(id, dto.newPassword)
}


}
