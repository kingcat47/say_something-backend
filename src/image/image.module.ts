import { Module } from '@nestjs/common';
import {ImageGateway} from "./image.gateway";
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

@Module({
  imports: [
  ],
  providers: [ImageGateway, ImageService],
  controllers: [ImageController]
})
export class ImageModule {}
