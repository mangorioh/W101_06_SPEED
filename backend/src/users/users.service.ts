import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(username: string, password_plain: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password_plain, 10); // Hash the password
        const createdUser = new this.userModel({ username, password: hashedPassword });
        return createdUser.save();
    }

    async findOne(username: string): Promise<User | null> {
        return this.userModel.findOne({ username }).exec();
    }
}