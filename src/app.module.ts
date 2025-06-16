import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { LinkModule } from './modules/link/link.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ...(process.env.METRICS_ENABLED === 'true'
      ? [PrometheusModule.register()]
      : []),
    TerminusModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    LinkModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
