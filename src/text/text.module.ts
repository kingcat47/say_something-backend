import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {TextGateway} from "./text.gateway";
import {UserNameModule} from "../share/user-name.module";

@Module({
  imports: [UserNameModule
  ],
  providers: [TextGateway],
})
export class TextModule {}
