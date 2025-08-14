// image.service.ts
import { Injectable } from '@nestjs/common';
import { S3, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class ImageService {
    private s3: S3;

    constructor() {
        this.s3 = new S3({
            endpoint: process.env.R2_ENDPOINT, // e.g. https://<account_id>.r2.cloudflarestorage.com
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


        await this.s3.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );


        const url = await getSignedUrl(
            this.s3,
            new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
            }),
            { expiresIn: 60 },
        );

        return url;
    }
}
