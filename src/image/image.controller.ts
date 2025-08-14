// image.controller.ts
import {Body, Controller, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
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
    async upload(@UploadedFile() file: Express.Multer.File, @Body('port') port: string) {
        const presignedUrl = await this.imageService.uploadAndGetUrl(file);

        // 소켓으로 클라이언트에 전송
        this.imageGateway.sendToClients(port || '', presignedUrl);

        return { url: presignedUrl };
    }
}
