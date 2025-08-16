import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class ImageService {
    private s3Client: S3Client;
    private bucket: string;
    private publicEndpoint: string;

    constructor() {
        this.bucket = process.env.CLOUDFLARE_R2_BUCKET!;
        this.publicEndpoint = process.env.CLOUDFLARE_R2_PUBLIC_ENDPOINT!; // r2.dev 주소
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: process.env.CLOUDFLARE_R2_ENDPOINT, // S3 API용 endpoint (cloudflarestorage.com)
            credentials: {
                accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
            },
        });
    }

    async uploadImage(fileBuffer: Buffer, originalName: string): Promise<string> {
        const fileKey = `${Date.now()}-${randomUUID()}-${originalName}`;
        try {
            console.log('업로드시작');
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: fileKey,
                    Body: fileBuffer,
                    ACL: 'public-read',
                }),
            );
            // 프론트에서 접근할 공개 URL은 r2.dev 엔드포인트로 반환
            return `${this.publicEndpoint}/${fileKey}`;
        } catch (error) {
            console.error('R2 업로드 실패', error);
            throw new InternalServerErrorException('이미지 업로드 실패');
        }
    }

    async deleteImage(fileUrl: string): Promise<void> {
        try {
            const url = new URL(fileUrl);
            const pathname = url.pathname.replace(/^\/+/, '');
            // bucket명이 포함돼 있을 수 있으므로 fileKey만 추출
            const key = pathname.includes('/')
                ? pathname.split('/').pop()!
                : pathname;
            console.log('삭제 키:', key);
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
            console.log('삭제함');
        } catch (error) {
            console.error('R2 삭제 실패', error);
            throw new InternalServerErrorException('이미지 삭제 실패');
        }
    }
}
