import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  getRoot() {
    return {
      message: 'TribeCore API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV'),
      cors: {
        frontendUrl: this.configService.get('FRONTEND_URL'),
        corsOrigin: this.configService.get('CORS_ORIGIN'),
      },
    };
  }

  @Get('cors-test')
  corsTest() {
    return {
      message: 'CORS is working!',
      timestamp: new Date().toISOString(),
      headers: 'If you can see this, CORS is configured correctly',
    };
  }
}
