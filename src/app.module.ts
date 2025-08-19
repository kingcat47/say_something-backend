import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
import { TextModule } from './text/text.module';
// import { typeOrmConfig } from './configs/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageModule } from './image/image.module';
import { GifModule } from './gif/gif.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TextModule,
    ImageModule,
    GifModule,
  ],
  controllers: [AppController],
  providers: [AppService],  // AppService 반드시 등록 필요
})
export class AppModule {}
