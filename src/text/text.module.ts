import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextEntity } from './entities/text.entity';
import { Port_TextEntity } from './entities/port_text.entity';
import { TextController } from './text.controller';
import { TextService } from './text.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TextEntity, Port_TextEntity]),
  ],
  controllers: [TextController],
  providers: [TextService],
})
export class TextModule {}
