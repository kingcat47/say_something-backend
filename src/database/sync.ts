import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

// 엔티티들을 여기에 임포트하거나 엔티티 파일 경로로 지정
import { TextEntity } from '../text/entities/text.entity';
import { Port_TextEntity } from '../text/entities/port_text.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,            // .env에 DB_HOST 설정 필요
    port: parseInt(process.env.DB_PORT || '5432', 10),   // 5432 기본 포트
    username: process.env.DB_USERNAME,    // .env에 DB_USERNAME 설정 필요
    password: process.env.DB_PASSWORD,    // .env에 DB_PASSWORD 설정 필요
    database: process.env.DB_DATABASE,    // .env에 DB_DATABASE 설정 필요
    entities: [TextEntity, Port_TextEntity],
    synchronize: true,                    // 개발에서만 true 권장, 운영에서는 false 권장
    logging: true,                       // 필요 시 로깅 활성화 가능
});
