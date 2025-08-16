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
        this.publicEndpoint = process.env.CLOUDFLARE_R2_PUBLIC_ENDPOINT!;
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
            console.log('[R2] 업로드 시작, bucket:', this.bucket, ', key:', fileKey);
            const res = await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: fileKey,
                    Body: fileBuffer,
                    ACL: 'public-read',
                }),
            );
            console.log('[R2] 업로드 응답:', res);
            return `${this.publicEndpoint}/${fileKey}`;
        } catch (error) {
            console.error('[R2] 업로드 실패', error);
            throw new InternalServerErrorException('이미지 업로드 실패');
        }
    }

    async deleteImage(fileUrl: string): Promise<void> {
        try {
            console.log('[R2] 삭제 요청 url:', fileUrl);
            const url = new URL(fileUrl);
            const pathname = url.pathname.replace(/^\/+/, '');
            const key = pathname.includes('/')
                ? pathname.split('/').pop()!
                : pathname;
            const decodedKey = decodeURIComponent(key);
            console.log('[R2] 삭제 키:', decodedKey);
            console.log('[R2] 삭제 버킷:', this.bucket);
            const res = await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: decodedKey,
                }),
            );
            console.log('[R2] DeleteObjectCommand 응답:', res);
            // 실제 대시보드에 들어가 key 일치 여부 직접 확인하라는 안내
            console.log('[R2] 대시보드에서 실제 삭제된지 반드시 확인 필요! 삭제키 완전일치 여부 수동 검증!!');
            console.log('[R2] 삭제함');
        } catch (error) {
            console.error('[R2] 삭제 실패', error);
            throw new InternalServerErrorException('이미지 삭제 실패');
        }
    }
}
