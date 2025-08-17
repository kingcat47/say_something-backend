import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { ImageGateway } from './image.gateway';
import { TextGateway } from '../text/text.gateway';

@Controller('image')
export class ImageController {
    constructor(
        private readonly imageService: ImageService,
        private readonly imageGateway: ImageGateway,
        private readonly textGateway: TextGateway,  // 추가
    ) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Body('port') port: string,
        @Body('socketId') socketId: string, // 클라이언트에서 socket.id 보내기
    ) {
        if (!file) {
            throw new Error('파일이 없습니다.');
        }

        const imageUrl = await this.imageService.uploadImage(file.buffer, file.originalname);

        // TextGateway의 clientNames에서 이름 조회
        const name = this.textGateway.clientNames.get(socketId) || '(익명)';

        // Gateway 메서드로 이미지 + 이름 전송
        this.imageGateway.sendToClients(port, imageUrl, name);

        // 30초 후 임시 삭제
        setTimeout(() => {
            this.imageService.deleteImage(imageUrl);
        }, 30_000);

        return { url: imageUrl };
    }
}
