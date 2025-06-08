import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
      findAll: jest.fn(),
      updateRole: jest.fn(),
      deleteById: jest.fn(),
      invalidatePassword: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return user profile if userId present', async () => {
      const user = { _id: '1', username: 'test', role: 'user' };
      usersService.findById.mockResolvedValue(user);
      const req = { user: { userId: '1' } };
      expect(await controller.getMe(req)).toEqual(user);
    });
    it('should throw UnauthorizedException if no userId', async () => {
      await expect(controller.getMe({ user: {} })).rejects.toThrow(UnauthorizedException);
    });
    it('should throw NotFoundException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);
      const req = { user: { userId: '1' } };
      await expect(controller.getMe(req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const users = [{ _id: '1', username: 'a', role: 'user' }];
      usersService.findAll.mockResolvedValue(users);
      expect(await controller.getAll()).toEqual(users);
    });
  });

  describe('getById', () => {
    it('should return user if found', async () => {
      const user = { _id: '1', username: 'a', role: 'user' };
      usersService.findById.mockResolvedValue(user);
      expect(await controller.getById('1')).toEqual(user);
    });
    it('should throw NotFoundException if not found', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(controller.getById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRole', () => {
    it('should return updated user', async () => {
      const user = { _id: '1', username: 'a', role: 'mod' };
      usersService.updateRole.mockResolvedValue(user);
      expect(await controller.updateRole('1', 'mod')).toEqual(user);
    });
    it('should throw NotFoundException if not found', async () => {
      usersService.updateRole.mockResolvedValue(null);
      await expect(controller.updateRole('1', 'mod')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should return result if deleted', async () => {
      usersService.deleteById.mockResolvedValue({ deleted: true });
      expect(await controller.deleteUser('1')).toEqual({ deleted: true });
    });
    it('should throw NotFoundException if not deleted', async () => {
      usersService.deleteById.mockResolvedValue({ deleted: false });
      await expect(controller.deleteUser('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('invalidatePassword', () => {
    it('should return user if successful', async () => {
      const user = { _id: '1', username: 'a', role: 'user' };
      usersService.invalidatePassword.mockResolvedValue(user);
      expect(await controller.invalidatePassword('1')).toEqual(user);
    });
    it('should throw NotFoundException if not found', async () => {
      usersService.invalidatePassword.mockResolvedValue(null);
      await expect(controller.invalidatePassword('1')).rejects.toThrow(NotFoundException);
    });
  });
});
