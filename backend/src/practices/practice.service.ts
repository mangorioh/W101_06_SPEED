import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Practice, PracticeDocument } from './practice.schema';

@Injectable()
export class PracticeService {
  constructor(
    @InjectModel(Practice.name) private readonly practiceModel: Model<PracticeDocument>,
  ) {}

  /**
   * Find all practices.
   */
  async findAll(): Promise<Practice[]> {
    return this.practiceModel.find().exec();
  }

  /**
   * Find a single practice by its ID.
   */
  async findOne(id: string): Promise<Practice> {
    const practice = await this.practiceModel.findById(id).exec();
    if (!practice) {
      throw new NotFoundException(`Practice with id "${id}" not found`);
    }
    return practice;
  }

  /**
   * Create a new Practice.
   */
  async create(name: string, valid = true): Promise<Practice> {
    const created = new this.practiceModel({ name, valid });
    return created.save();
  }

  /**
   * Rename a Practice (update its `name` field).
   */
  async rename(id: string, newName: string): Promise<Practice> {
    const updated = await this.practiceModel
      .findByIdAndUpdate(
        id,
        { name: newName },
        { new: true /* return the updated document */ },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException(`Practice with id "${id}" not found`);
    }
    return updated;
  }

  /**
   * Set the `valid` field on a Practice.
   */
  async setValidity(id: string, isValid: boolean): Promise<Practice> {
    const updated = await this.practiceModel
      .findByIdAndUpdate(
        id,
        { valid: isValid },
        { new: true /* return the updated document */ },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException(`Practice with id "${id}" not found`);
    }
    return updated;
  }
}