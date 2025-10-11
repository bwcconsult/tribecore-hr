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

  // CORS - Allow frontend origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tribecore-hr-production-frontend.up.railway.app',
    'https://amazing-squirrel-174b09.netlify.app', // Netlify deployment
    configService.get('FRONTEND_URL'),
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow all origins in development
      if (configService.get('NODE_ENV') === 'development') {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed === '*')) {
        return callback(null, true);
      }
      
      // Allow any Railway deployment
      if (origin.includes('railway.app')) {
        return callback(null, true);
      }
      
      // Allow any Netlify deployment
      if (origin.includes('netlify.app')) {
        return callback(null, true);
      }
      
      // Default: allow all in production (you can restrict this later)
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
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
