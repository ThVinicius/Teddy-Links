import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { BusinessError } from '../../application/errors/business.error';

@Catch(BusinessError)
export class BusinessExceptionFilter implements ExceptionFilter {
  catch(exception: BusinessError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.statusCode;
    const message = exception.message;

    response.status(status).json({
      statusCode: status,
      message: message,
      error: exception.name
    });
  }
}
