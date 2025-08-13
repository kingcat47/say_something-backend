import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('image')
export class ImageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bytea', nullable: true })
    image: Buffer | null;

    @Column({ type: 'int', default: 0 })
    count: number;
}
