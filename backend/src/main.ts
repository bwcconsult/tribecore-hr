import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS - Dynamic origin based on environment
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    configService.get('FRONTEND_URL'),
    configService.get('CORS_ORIGIN'),
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow all origins in development
      if (configService.get('NODE_ENV') === 'development') {
        return callback(null, true);
      }
      
      // Check whitelist in production
      if (allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.includes(o))) {
        callback(null, true);
      } else {
        // Still allow in production for now (can be restricted later)
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'x-requested-with',
    ],
    exposedHeaders: [
      'Content-Length',
      'Content-Type',
      'Authorization',
      'X-Total-Count',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TribeCore API')
    .setDescription('TribeCore - Global HR, Payroll & Employee Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Employees', 'Employee management')
    .addTag('Payroll', 'Payroll management')
    .addTag('Leave', 'Leave and attendance management')
    .addTag('Performance', 'Performance management')
    .addTag('Compliance', 'Compliance and audit')
    .addTag('Reports', 'Reports and analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`
  🚀 TribeCore API is running!
  📝 API: http://localhost:${port}/${apiPrefix}
  📚 Swagger: http://localhost:${port}/${apiPrefix}/docs
  🌍 Environment: ${configService.get('NODE_ENV')}
  `);
}

bootstrap();
