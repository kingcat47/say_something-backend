import { Module } from '@nestjs/common';
import {ImageGateway} from "./image.gateway";
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import {TextModule} from "../text/text.module";

@Module({
  imports: [TextModule
  ],
  providers: [ImageGateway, ImageService],
  controllers: [ImageController]
})
export class ImageModule {}
