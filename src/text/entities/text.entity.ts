import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('text')
export class TextEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    text: string | null;

    @Column({ type: 'int', default: 0 })
    count: number;
}
