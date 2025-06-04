import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { PracticeService } from './practice.service';
import { Practice } from './practice.schema';

@Controller('practices')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  /**
   * GET /practices
   * Returns all practices.
   */
  @Get()
  async findAll(): Promise<Practice[]> {
    return this.practiceService.findAll();
  }

  /**
   * GET /practices/:id
   * Returns a single practice by ID.
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Practice> {
    return this.practiceService.findOne(id);
  }

  /**
   * POST /practices
   * Creates a new practice. Body must include { name: string; valid?: boolean }.
   */
  @Post()
  async create(
    @Body('name') name: string,
    @Body('valid') valid?: boolean,
  ): Promise<Practice> {
    // if `valid` is omitted, default true
    return this.practiceService.create(name, valid ?? true);
  }

  /**
   * PATCH /practices/:id/rename
   * Renames an existing practice. Body must include { name: string }.
   */
  @Patch(':id/rename')
  async rename(
    @Param('id') id: string,
    @Body('name') name: string,
  ): Promise<Practice> {
    return this.practiceService.rename(id, name);
  }

  /**
   * PATCH /practices/:id/valid
   * Sets the `valid` flag on a practice. Body must include { valid: boolean }.
   */
  @Patch(':id/valid')
  async setValidity(
    @Param('id') id: string,
    @Body('valid') valid: boolean,
  ): Promise<Practice> {
    return this.practiceService.setValidity(id, valid);
  }

}