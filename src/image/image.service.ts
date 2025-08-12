import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity } from "../image/entities/image.entity";
import { Repository } from "typeorm";
import { Port_ImageEntity } from "../image/entities/port_image.entity";

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(ImageEntity)
        private readonly imageRepository: Repository<ImageEntity>,

        @InjectRepository(Port_ImageEntity)
        private readonly portImageRepository: Repository<Port_ImageEntity>,
    ) {}


    async saveImage(newImage: Buffer): Promise<{ oldImage: Buffer | null; count: number }> {

        let record = await this.imageRepository.findOne({ where: {} });

        if (!record) {

            record = this.imageRepository.create({
                image: newImage,
                count: 1,
            });
            await this.imageRepository.save(record);
            return { oldImage: null, count: 1 };
        }

        const oldImage = record.image ?? null;
        record.image = newImage;
        record.count += 1;

        await this.imageRepository.save(record);

        return { oldImage, count: record.count };
    }

    async sayImage_port(port_str: string, newImage: Buffer): Promise<{ oldImage: Buffer | null; portStr: string }> {
        let slot = await this.portImageRepository.findOne({ where: { port_str } });
        const oldImage = slot?.image ?? null;

        if (!slot) {
            const newSlot = this.portImageRepository.create({ port_str, image: newImage });
            await this.portImageRepository.save(newSlot);
        } else {
            slot.image = newImage;
            await this.portImageRepository.save(slot);
        }
        return { oldImage, portStr: port_str };
    }

}
