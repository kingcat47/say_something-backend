import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('port_image')
export class Port_ImageEntity {
    @PrimaryColumn({ type: 'varchar', length: 50 })
    port_str: string | null;

    @Column({ type: 'bytea', nullable: true })
    image: Buffer | null;
}