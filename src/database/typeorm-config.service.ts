import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get<string>('DATABASE_TYPE'),
      host: this.configService.get<string>('DATABASE_HOST'),
      port: Number(
        this.configService.get<string>('DATABASE_CONTAINER_PORT') ??
          this.configService.get<string>('DATABASE_HOST_PORT')
      ),
      username: this.configService.get<string>('DATABASE_USERNAME'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      ssl: {
        rejectUnauthorized: false,
        ca: false
      },
      synchronize: false,
      dropSchema: false,
      keepConnectionAlive: true,
      logging: this.configService.get<string>('NODE_ENV') !== 'production',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        migrationsDir: 'src/database/migrations'
      }
    } as TypeOrmModuleOptions;
  }
}
