import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Get()
    @Roles('owner')
    findAll() {
        return this.userService.findAll();
    }

    @Patch(':id/role')
    @Roles('owner')
    async updateRole(@Param('id') id: string, @Body('role') role: string) {
        return this.userService.updateRole(id, role);
    }

    @Delete(':id')
    @Roles('owner')
    async deleteUser(@Param('id') id: string) {
        return this.userService.deleteById(id);
    }

    @Patch(':id/invalidate-password')
    @Roles('owner')
    async invalidatePassword(@Param('id') id: string) {
        return this.userService.invalidatePassword(id);
    }
}
