import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface JwtUser {
  username: string;
  role: string;
}

@Controller('user')
@UseGuards(JwtAuthGuard)
export class MeController {
  @Get('me')
  getMe(@Req() req: Request & { user: JwtUser }) {
    const { username, role } = req.user;
    return { username, role };
  }
}
