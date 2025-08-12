import { Entity, Column } from 'typeorm';

@Entity('text')
export class TextEntity {
    @Column({ type: 'text', nullable: true })
    text: string | null;
    @Column({ type: 'int', default: 0 })
    count: number;
}
