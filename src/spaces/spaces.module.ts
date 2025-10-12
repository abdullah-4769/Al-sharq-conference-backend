import { Module } from '@nestjs/common'
import { SpacesService } from './spaces.service'
import { SpacesController } from './spaces.controller'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [SpacesService],
  controllers: [SpacesController],
  exports: [SpacesService],
})
export class SpacesModule {}
