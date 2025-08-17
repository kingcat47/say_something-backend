import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {TextGateway} from "./text.gateway";

@Module({
  imports: [
  ],
  providers: [TextGateway],
  exports: [TextGateway],
})
export class TextModule {}
