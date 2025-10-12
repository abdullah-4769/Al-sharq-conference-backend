import { Module } from '@nestjs/common';
import { ExhibiterosService } from './exhibiteros.service';
import { ExhibiterosController } from './exhibiteros.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { SpacesModule } from '../../spaces/spaces.module'


@Module({
    imports: [SpacesModule],

  controllers: [ExhibiterosController],
  providers: [ExhibiterosService, PrismaService],
})
export class ExhibiterosModule {}
