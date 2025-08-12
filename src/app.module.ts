import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',  // 본인 DB 사용자명
      password: 'password',  // 본인 DB 비밀번호
      database: 'dbname',    // 본인 DB 이름
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,     // 개발환경에서만 true 권장 (자동 테이블 동기화)
    }),
    // ...다른 모듈들
  ],
})
export class AppModule {}
