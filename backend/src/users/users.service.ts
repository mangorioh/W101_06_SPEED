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
        const createdUser = new this.userModel({
            username,
            password: hashedPassword,
        });
        return createdUser.save();
    }

    async findOne(username: string): Promise<User | null> {
        return this.userModel.findOne({ username }).exec();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().select('-password').exec(); // Exclude password field
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).select('-password').exec();
    }

    async deleteById(id: string): Promise<{ deleted: boolean }> {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        return { deleted: result.deletedCount === 1 };
    }

    async updateRole(id: string, role: string): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-password').exec();
    }

    async invalidatePassword(id: string): Promise<User | null> {
        // Set password to a random string the user will never know
        const random = Math.random().toString(36).slice(2) + Date.now();
        const hashed = await bcrypt.hash(random, 10);
        return this.userModel.findByIdAndUpdate(id, { password: hashed }, { new: true }).select('-password').exec();
    }
}