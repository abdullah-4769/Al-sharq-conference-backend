import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SponsorService } from './sponsor.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Controller('sponsors')
export class SponsorController {
  constructor(private readonly sponsorService: SponsorService) {}

  @Post()
  create(@Body() dto: CreateSponsorDto) {
    return this.sponsorService.createSponsor(dto);
  }
  

  @Get()
  findAll() {
    return this.sponsorService.getAllSponsors();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sponsorService.getSponsorById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSponsorDto) {
    return this.sponsorService.updateSponsor(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sponsorService.deleteSponsor(id);
  }

@Get(':id/details')
getDetails(@Param('id', ParseIntPipe) id: number) {
  return this.sponsorService.getSponsorWithDetails(id);
}


}
