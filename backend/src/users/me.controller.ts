import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class MeController {
  @Get('me')
  getMe(@Req() req) {
    // req.user is set by JwtStrategy
    const { username, role } = req.user;
    return { username, role };
  }
}
