import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ClaimService } from './claim.service';
import { Claim } from './claim.schema';

@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @Get()
  async findAll(): Promise<Claim[]> {
    return this.claimService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Claim> {
    return this.claimService.findOne(id);
  }

  @Post()
  async create(
    @Body('name') name: string,
    @Body('valid') valid?: boolean,
  ): Promise<Claim> {
    // if `valid` is omitted, default true
    return this.claimService.create(name, valid ?? true);
  }

  @Patch(':id/rename')
  async rename(
    @Param('id') id: string,
    @Body('name') name: string,
  ): Promise<Claim> {
    return this.claimService.rename(id, name);
  }

  @Patch(':id/valid')
  async setValidity(
    @Param('id') id: string,
    @Body('valid') valid: boolean,
  ): Promise<Claim> {
    return this.claimService.setValidity(id, valid);
  }
}
