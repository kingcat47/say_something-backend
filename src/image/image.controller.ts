
import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { ImageGateway } from './image.gateway';
import { UserNameService } from '../share/user-name.service'

@Controller('image')
export class ImageController {
    constructor(
        private readonly imageService: ImageService,
        private readonly imageGateway: ImageGateway,
        private readonly userNameService: UserNameService,
    ) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Body('port') port: string,
        @Body('socketId') socketId: string,
    ) {
        if (!file) {
            throw new Error('파일이 없습니다.');
        }

        const imageUrl = await this.imageService.uploadImage(file.buffer, file.originalname);

        const name = this.userNameService.getName(socketId) || '(익명)';

        this.imageGateway.sendToClients(port, imageUrl, name);

        setTimeout(() => {
            this.imageService.deleteImage(imageUrl);
        }, 30_000);

        return { url: imageUrl };
    }
}
