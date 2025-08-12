import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ImageEntity} from "../image/entities/image.entity";
import {Port_ImageEntity} from "../image/entities/port_image.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageEntity, Port_ImageEntity]),
  ],
  controllers: [ImageController],
  providers: [ImageService]
})
export class ImageModule {}
