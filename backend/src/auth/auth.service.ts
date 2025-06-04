import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    // Fetch the full user document (including password)
    const userDoc = await this.usersService['userModel'].findOne({ username }).exec();
    if (userDoc && (await bcrypt.compare(pass, userDoc.password))) {
      // Return safe fields only
      const { _id, username, role } = userDoc;
      return { _id, username, role } as Omit<User, 'password'>;
    }
    return null;
  }

  login(user: UserDocument) {
    const payload = {
      sub: user._id,
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
      throw new ConflictException('Username already exists');
    }
    const newUser = await this.usersService.create(username, password_plain);
    const { password, ...result } = newUser as any;
    return result;
  }
}
