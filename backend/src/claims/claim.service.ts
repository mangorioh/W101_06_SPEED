import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Claim, ClaimDocument } from './claim.schema';

@Injectable()
export class ClaimService {
  constructor(
    @InjectModel(Claim.name) private readonly claimModel: Model<ClaimDocument>,
  ) {}

  /**
   * Find all claims.
   */
  async findAll(): Promise<Claim[]> {
    return this.claimModel.find().exec();
  }

  /**
   * Find a single claim by its ID.
   */
  async findOne(id: string): Promise<Claim> {
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }
    return claim;
  }

  /**
   * Create a new Claim.
   */
  async create(name: string, valid = true): Promise<Claim> {
    const created = new this.claimModel({ name, valid });
    return created.save();
  }

  /**
   * Rename a Claim (update its `name` field).
   */
  async rename(id: string, newName: string): Promise<Claim> {
    const updated = await this.claimModel
      .findByIdAndUpdate(
        id,
        { name: newName },
        { new: true /* return the updated document */ },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }
    return updated;
  }

  /**
   * Set the `valid` field on a Claim.
   */
  async setValidity(id: string, isValid: boolean): Promise<Claim> {
    const updated = await this.claimModel
      .findByIdAndUpdate(
        id,
        { valid: isValid },
        { new: true /* return the updated document */ },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }
    return updated;
  }
}
