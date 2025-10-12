import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { SpacesService } from './spaces.service'
import type { Response } from 'express'

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.spacesService.uploadFile(file.originalname, file.buffer, file.mimetype)
    return result
  }

  @Get('download/:fileName')
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const file = await this.spacesService.getFile(fileName)
    res.send(file)
  }
}
