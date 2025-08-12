import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextEntity } from './entities/text.entity';
import { Port_TextEntity } from './entities/port_text.entity';

@Injectable()
export class TextService {
    constructor(
        @InjectRepository(TextEntity)
        private readonly textRepository: Repository<TextEntity>,
        @InjectRepository(Port_TextEntity)
        private readonly portTextRepository: Repository<Port_TextEntity>,
    ) {}

    async sayText(newText: string): Promise<{ oldText: string; count: number }> {
        let record = await this.textRepository.findOne({ where: {} });

        if (!record) {
            record = this.textRepository.create({
                text: newText,
                count: 1,
            });
            await this.textRepository.save(record);
            return { oldText: newText, count: 1 };  // oldText를 newText로 변경
        }

        record.text = newText;
        record.count += 1;

        await this.textRepository.save(record);

        return { oldText: newText, count: record.count };  // oldText를 newText로 변경
    }

    async sayText_port(port_str: string, newText: string): Promise<{ oldText: string; portStr: string }> {
        let slot = await this.portTextRepository.findOne({ where: { port_str } });

        if (!slot) {
            const newSlot = this.portTextRepository.create({ port_str, text: newText });
            await this.portTextRepository.save(newSlot);
        } else {
            slot.text = newText;
            await this.portTextRepository.save(slot);
        }
        return { oldText: newText, portStr: port_str };  // oldText도 newText로 변경
    }

}
