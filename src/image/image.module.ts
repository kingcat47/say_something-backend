import { Module } from '@nestjs/common';
import {ImageGateway} from "./image.gateway";
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import {UserNameModule} from "../share/user-name.module";

@Module({
  imports: [UserNameModule
  ],
  providers: [ImageGateway, ImageService],
  controllers: [ImageController]
})
export class ImageModule {}
