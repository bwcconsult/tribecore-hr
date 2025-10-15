import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

/**
 * DEBUG CONTROLLER - Remove in production!
 * This bypasses all guards and CORS to test auth functionality
 */
@Controller('auth-debug')
export class AuthDebugController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('test')
  async test() {
    return {
      status: 'Auth module is working',
      timestamp: new Date().toISOString(),
      message: 'If you see this, the backend is running and reachable',
    };
  }

  @Get('check-user')
  async checkUser() {
    try {
      const user = await this.usersService.findByEmail('bill.essien@bwcconsult.com');
      
      if (!user) {
        return {
          status: 'USER_NOT_FOUND',
          message: 'No user with email bill.essien@bwcconsult.com exists in database',
          action: 'You need to create this user first via signup or seed script',
        };
      }

      return {
        status: 'USER_EXISTS',
        message: 'User found in database',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          roles: user.roles,
        },
      };
    } catch (error) {
      return {
        status: 'ERROR',
        message: error.message,
        stack: error.stack,
      };
    }
  }

  @Post('test-login')
  async testLogin(@Body() body: { email: string; password: string }) {
    try {
      const result = await this.authService.login({
        email: body.email,
        password: body.password,
      });

      return {
        status: 'LOGIN_SUCCESS',
        message: 'Login works! The issue is CORS or frontend configuration',
        result,
      };
    } catch (error) {
      return {
        status: 'LOGIN_FAILED',
        message: error.message,
        reason: error.response?.message || 'Unknown error',
        statusCode: error.status || 500,
      };
    }
  }

  @Get('cors-info')
  async corsInfo() {
    return {
      status: 'CORS Configuration',
      environment: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL,
      corsOrigin: process.env.CORS_ORIGIN,
      message: 'Check if these match your actual frontend URL',
    };
  }
}
