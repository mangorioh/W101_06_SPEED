import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  login(user: User) {
    const payload = {
      username: user.username,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    username: string,
    password_plain: string,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    const newUser = await this.usersService.create(username, password_plain);
    const { ...result } = newUser;
    return result;
  }
}
