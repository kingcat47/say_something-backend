import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

import { TextEntity } from './text/entities/text.entity';
import { Port_TextEntity } from './text/entities/port_text.entity';

import { TextService } from './text/text.service';
import { TextController } from './text/text.controller';

@Module({
  imports: [
    // DB 연결 설정
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [TextEntity, Port_TextEntity],
        synchronize: true, // 개발 중만 true
        logging: true,
      }),
    }),

    // 엔티티별 리포지토리 주입 등록
    TypeOrmModule.forFeature([TextEntity, Port_TextEntity]),
  ],
  controllers: [TextController],
  providers: [TextService],
})
export class AppModule {}
