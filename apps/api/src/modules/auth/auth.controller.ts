// MM-010 — REST /auth/* endpoints (ADR-0001 §1).
// Public (no guard). All other resolvers/controllers default-secure via
// LocalAuthGuard (added in MM-026 as a global APP_GUARD).

import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

import { AuthService, type AuthResponse } from './auth.service';
import { LocalAuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDto): Promise<AuthResponse> {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto): Promise<AuthResponse> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshDto, @CurrentUser() user: AuthUser): Promise<void> {
    await this.authService.logout(user.id, dto.refreshToken);
  }

  // Smoke endpoint for MM-010 acceptance: confirms auth context is wired through.
  @Get('me')
  @UseGuards(LocalAuthGuard)
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
