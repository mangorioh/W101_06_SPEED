import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  /**
   * Create a new user. Throws ConflictException if username exists.
   * Returns user data excluding password.
   */
  async create(
    username: string,
    password_plain: string
  ): Promise<{ _id: any; username: string; role: string }> {
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password_plain, 10);
    const createdUser = new this.userModel({
      username,
      password: hashedPassword,
      role: 'user', // Default role
    });
    const savedUser = await createdUser.save();
    // Return only safe fields
    return {
      _id: savedUser._id,
      username: savedUser.username,
      role: savedUser.role,
    };
  }

  /**
   * Find a user by username. Excludes password by default.
   */
  async findOne(username: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userModel.findOne({ username }).select('-password').exec();
    return user;
  }

  /**
   * Find all users, excluding passwords.
   */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.userModel.find().select('-password').exec();
  }

  /**
   * Find a user by ID, excluding password.
   */
  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  /**
   * Delete a user by ID.
   */
  async deleteById(id: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return { deleted: result.deletedCount === 1 };
  }

  /**
   * Update a user's role by ID, excluding password in response.
   */
  async updateRole(id: string, role: string): Promise<Omit<User, 'password'> | null> {
    return this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .select('-password')
      .exec();
  }

  /**
   * Invalidate a user's password by setting it uncalculatable hash.
   * Excludes password in response.
   */
  async invalidatePassword(id: string): Promise<Omit<User, 'password'> | null> {
    return this.userModel
      .findByIdAndUpdate(id, { password: "!" }, { new: true })
      .select('-password')
      .exec();
  }
}
