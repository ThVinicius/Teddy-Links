import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator
} from '@nestjs/terminus';

@Controller('healthz')
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 100000 })
    ]);
  }
}
