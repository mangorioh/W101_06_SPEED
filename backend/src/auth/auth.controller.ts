import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from '../users/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: { user: UserDocument }) {
    // passport-local puts the validated user in req.user
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(
      createUserDto.username,
      createUserDto.password,
    );
  }
}
