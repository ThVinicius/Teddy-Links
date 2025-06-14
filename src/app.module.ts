import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkModule } from './modules/link/link.module';
import { TypeOrmConfigService } from './database/typeorm-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    LinkModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
