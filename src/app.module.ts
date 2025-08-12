import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TextEntity } from './text/entities/text.entity';
import { Port_TextEntity } from './text/entities/port_text.entity';

import { TextService } from './text/text.service';
import { TextController } from './text/text.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,           // 예: 'localhost'
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,   // 예: 'postgres'
      password: process.env.DB_PASSWORD,   // 예: 'yourpassword'
      database: process.env.DB_DATABASE,   // 예: 'postgres'
      entities: [TextEntity, Port_TextEntity],
      synchronize: true,                   // 개발 환경에서만 true 권장
      logging: true,                      // 필요하면 true
    }),

    // 엔티티별 리포지토리 DI 등록
    TypeOrmModule.forFeature([TextEntity, Port_TextEntity]),
  ],
  controllers: [TextController],
  providers: [TextService],
})
export class AppModule {}
