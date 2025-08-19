import { Module } from '@nestjs/common';
import { GifGateway } from './gif.gateway';
import { UserNameService } from '../share/user-name.service'; // 필요 시 경로 조정

@Module({
    providers: [GifGateway, UserNameService], // Gateway와 의존하는 서비스 등록
    exports: [GifGateway],
})
export class GifModule {}
