import { Module } from '@nestjs/common';
import {ImageGateway} from "./image.gateway";

@Module({
  imports: [
  ],
  providers: [ImageGateway]
})
export class ImageModule {}
