import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user; // Exclude password from the returned object
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user._doc.username, sub: user._doc._id, role: user._doc.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(username: string, password_plain: string): Promise<any> {
        const existingUser = await this.usersService.findOne(username);
        if (existingUser) {
            throw new Error('Username already exists'); // Or use NestJS HttpException
        }
        const newUser = await this.usersService.create(username, password_plain);
        const { password, ...result } = newUser;
        return result;
    }
}