import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class ImageService {
    private s3Client: S3Client;
    private bucket: string;

    constructor() {
        this.bucket = process.env.CLOUDFLARE_R2_BUCKET!;
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
            credentials: {
                accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
            },
        });
    }

    async uploadImage(fileBuffer: Buffer, originalName: string): Promise<string> {
        const fileKey = `${Date.now()}-${randomUUID()}-${originalName}`;
        try {
            console.log('업로드시작')
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: fileKey,
                    Body: fileBuffer,
                    ACL: 'public-read',
                }),
            );
            return `${process.env.CLOUDFLARE_R2_ENDPOINT}/${fileKey}`;
        } catch (error) {
            console.error('R2 업로드 실패', error);
            throw new InternalServerErrorException('이미지 업로드 실패');
        }
    }

    async deleteImage(fileUrl: string): Promise<void> {
        try {
            const url = new URL(fileUrl);
            const key = url.pathname.replace(/^\/+/, '');
            console.log('삭제함')
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
        } catch (error) {
            console.error('R2 삭제 실패', error);
            throw new InternalServerErrorException('이미지 삭제 실패');
        }
    }
}
