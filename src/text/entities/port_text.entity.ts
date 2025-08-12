import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('port_text')
export class Port_TextEntity {
    @PrimaryColumn({ type: 'varchar', length: 50 })
    port_str: string | null;
    @Column({ type: 'text', nullable: true })
    text: string | null;
}
