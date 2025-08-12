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
            return { oldText: 'your first', count: 1 };
        }

        const oldText = record.text ?? 'your first';
        record.text = newText;
        record.count += 1;

        await this.textRepository.save(record);

        return { oldText, count: record.count };
    }

    async sayText_port(port_str: string, newText: string): Promise<string> {
        let slot = await this.portTextRepository.findOne({ where: { port_str } });
        const oldText = slot?.text ?? 'your first';

        if (!slot) {
            const newSlot = this.portTextRepository.create({ port_str, text: newText });
            await this.portTextRepository.save(newSlot);
        } else {
            slot.text = newText;
            await this.portTextRepository.save(slot);
        }
        return oldText ?? 'your first';
    }
}
