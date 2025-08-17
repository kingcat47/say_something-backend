import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { ImageGateway } from './image.gateway';

@Controller('image')
export class ImageController {
    constructor(
        private readonly imageService: ImageService,
        private readonly imageGateway: ImageGateway,
    ) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Body('port') port: string,
        @Body('name') name: string, // 클라이언트에서 보낸 이름
    ) {
        if (!file) {
            throw new Error('파일이 없습니다.');
        }

        const imageUrl = await this.imageService.uploadImage(file.buffer, file.originalname);

        // Gateway 메서드로 이미지 + 이름 전송
        this.imageGateway.sendToClients(port, imageUrl, name);

        // 30초 후 자동 삭제
        setTimeout(() => {
            this.imageService.deleteImage(imageUrl);
        }, 30_000);

        return { url: imageUrl };
    }
}
