import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  /**
   * Get current user's profile.
   */
  @Get('me')
  @Roles('user', 'owner', 'mod')
  async getMe(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Get all users (admin/mod only).
   */
  @Get()
  @Roles('owner', 'mod')
  async getAll() {
    return this.userService.findAll();
  }

  /**
   * Get a user by ID (admin/mod only).
   */
  @Get(':id')
  @Roles('owner', 'mod')
  async getById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update a user's role (admin only).
   */
  @Patch(':id/role')
  @Roles('owner')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    const user = await this.userService.updateRole(id, role);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Delete a user (admin only).
   */
  @Delete(':id')
  @Roles('owner')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.deleteById(id);
    if (!result.deleted) throw new NotFoundException('User not found');
    return result;
  }

  /**
   * Invalidate a user's password (admin only).
   */
  @Patch(':id/invalidate-password')
  @Roles('owner')
  async invalidatePassword(@Param('id') id: string) {
    const user = await this.userService.invalidatePassword(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
