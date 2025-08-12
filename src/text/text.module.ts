import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextEntity } from './entities/text.entity';
import { Port_TextEntity } from './entities/port_text.entity';
import { TextController } from './text.controller';
import { TextService } from './text.service';
import {TextGateway} from "./text.gateway";

@Module({
  imports: [
    TypeOrmModule.forFeature([TextEntity, Port_TextEntity]),
  ],
  controllers: [TextController],
  providers: [TextService,TextGateway],
})
export class TextModule {}
