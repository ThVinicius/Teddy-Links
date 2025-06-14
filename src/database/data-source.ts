import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: (process.env.DATABASE_TYPE as 'postgres') || 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development'
});

export default AppDataSource;
