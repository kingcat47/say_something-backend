import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
import { TextEntity } from '../text/entities/text.entity';
import { Port_TextEntity } from '../text/entities/port_text.entity';
import {TypeOrmModule} from "@nestjs/typeorm";

TypeOrmModule.forRootAsync({
    useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [TextEntity, Port_TextEntity],
        synchronize: true,
        logging: true,
    }),
});
