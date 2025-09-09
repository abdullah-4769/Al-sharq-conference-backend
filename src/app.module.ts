import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { EventModule } from './admin/event/event.module';
import { SponsorModule } from './sponsor/set-sponsor-detail/sponsor.module';
import { ProductModule } from './sponsor/sponsor-related-products/product.module';
import { RepresentativeModule } from './sponsor/sponsor-representatives/representative.module';
import { ExhibiterosModule } from './exhibitor/create-exhibtorre/exhibiteros.module';
import { ExhibitorProductsModule } from './exhibitor/product-exhibtor/exhibitor-products.module';
import { ExhibitorRepresentativeModule } from './exhibitor/exhibitor-representative/exhibitor-representative.module';
import { BoothModule } from './exhibitor/booth/booth.module';
import { SpeakerModule } from './speaker/speaker.module';


@Module({
  imports: [AuthModule,
    ProfileModule,
    ProductModule,
    EventModule,
    ExhibiterosModule,
    SponsorModule,
    ExhibitorProductsModule,
    RepresentativeModule,
    ExhibitorRepresentativeModule,
    BoothModule,
    SpeakerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
