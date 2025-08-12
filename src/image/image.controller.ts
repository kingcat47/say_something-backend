import { Body, Controller, Param, Post } from '@nestjs/common';
import { ImageService } from '../image/image.service';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {} // 서비스 주입

    @Post()
    async saveImage(@Body('newImage') base64Image: string) {
        console.log('받은 이미지(Base64):', base64Image);

        const bufferImage = Buffer.from(base64Image, 'base64');

        const { oldImage, count } = await this.imageService.saveImage(bufferImage);
        console.log('반환할 이전 이미지:', oldImage);

        return {
            message: '이미지 저장 완료',
            previousImage: oldImage ? oldImage.toString('base64') : null, // 이전 이미지를 Base64로 반환
            count,
        };
    }

    // 특정 포트에 이미지 저장
    @Post('port/:port_str')
    async saveImage_port(
        @Param('port_str') port_str: string,
        @Body('newImage') base64Image: string,
    ) {
        console.log('인덱스:', port_str);
        console.log('받은 이미지(Base64):', base64Image);

        const bufferImage = Buffer.from(base64Image, 'base64');

        const oldImage = await this.imageService.sayImage_port(port_str, bufferImage);
        console.log('반환할 이전 이미지:', oldImage);

        return {
            message: '포트 이미지 저장 완료',
            previousImage: oldImage,
        };
    }
}
