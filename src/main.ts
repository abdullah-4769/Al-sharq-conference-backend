                                                import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin:['http://138.68.104.206:3001','http://localhost:3000','http://connect.sharqforum.org'    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });6

  await app.listen(3000,'0.0.0.0');
  console.log(`Server is running on http://localhost:3000`);
}

bootstrap();