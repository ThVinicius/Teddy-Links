import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { BusinessExceptionFilter } from './modules/link/adapters/error/business-exception.filter';
import { initOpenTelemetry } from './config/opentelemetry';
initOpenTelemetry();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new BusinessExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  const docConfig = new DocumentBuilder()
    .setTitle('API do Encurtador de Links - Teddy Open Finance')
    .setDescription(
      `Documentação oficial e interativa da API para o serviço de encurtamento de URLs Teddy Links.
      \n\nA API permite criar, gerenciar e monitorar links encurtados.
      \n\n**Autenticação:** Alguns endpoints são públicos, enquanto outros requerem autenticação via token JWT. 
      Para os endpoints protegidos, clique no botão 'Authorize' e insira seu token no formato 'Bearer {seu_token}'.`
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
