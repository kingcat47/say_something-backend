import { Injectable } from '@nestjs/common';
import { S3, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class ImageService {
    private s3: S3;

    constructor() {
        this.s3 = new S3({
            endpoint: process.env.R2_ENDPOINT,
            region: 'auto',
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY!,
                secretAccessKey: process.env.R2_SECRET_KEY!,
            },
        });
    }

    async uploadAndGetUrl(file: Express.Multer.File): Promise<string> {
        const ext = path.extname(file.originalname);
        const key = `${Date.now()}-${crypto.randomUUID()}${ext}`;

        // 1️⃣ S3에 업로드
        await this.s3.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        // 2️⃣ Presigned URL 생성 (클라이언트가 바로 접근)
        const url = await getSignedUrl(
            this.s3,
            new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
            }),
            { expiresIn: 60 }, // 1분 유효
        );

        // 3️⃣ 바로 서버에서 삭제
        await this.s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
            }),
        );

        return url;
    }
}
