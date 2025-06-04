import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUserModel = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

// Mock constructor for userModel
function MockUserModelConstructor(data: any) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue({
      _id: '1',
      username: data.username,
      role: data.role || 'user',
    }),
  };
}
// Attach static methods to the constructor function
(MockUserModelConstructor as any).findOne = jest.fn();
(MockUserModelConstructor as any).find = jest.fn();
(MockUserModelConstructor as any).findById = jest.fn();
(MockUserModelConstructor as any).findByIdAndUpdate = jest.fn();
(MockUserModelConstructor as any).deleteOne = jest.fn();
(MockUserModelConstructor as any).create = jest.fn();
(MockUserModelConstructor as any).save = jest.fn();

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModelConstructor,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user and return safe fields', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      userModel.save = jest.fn().mockResolvedValue({
        _id: '1',
        username: 'test',
        role: 'user',
      });
      userModel.create = jest.fn().mockImplementation((data) => ({
        ...data,
        save: userModel.save,
      }));
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');
      const result = await service.create('test', 'pw');
      expect(result).toEqual({ _id: '1', username: 'test', role: 'user' });
      expect(userModel.findOne).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
    });
    it('should throw ConflictException if username exists', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ username: 'test' }) });
      await expect(service.create('test', 'pw')).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return user without password', async () => {
      userModel.findOne.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '1', username: 'test', role: 'user' }) }) });
      const result = await service.findOne('test');
      expect(result).toEqual({ _id: '1', username: 'test', role: 'user' });
    });
    it('should return null if not found', async () => {
      userModel.findOne.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) });
      const result = await service.findOne('notfound');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      userModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: '1', username: 'a', role: 'user' }]) }) });
      const result = await service.findAll();
      expect(result).toEqual([{ _id: '1', username: 'a', role: 'user' }]);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      userModel.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '1', username: 'a', role: 'user' }) }) });
      const result = await service.findById('1');
      expect(result).toEqual({ _id: '1', username: 'a', role: 'user' });
    });
    it('should return null if not found', async () => {
      userModel.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) });
      const result = await service.findById('2');
      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should return {deleted: true} if deleted', async () => {
      userModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
      const result = await service.deleteById('1');
      expect(result).toEqual({ deleted: true });
    });
    it('should return {deleted: false} if not deleted', async () => {
      userModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
      const result = await service.deleteById('1');
      expect(result).toEqual({ deleted: false });
    });
  });

  describe('updateRole', () => {
    it('should update and return user if found', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '1', username: 'a', role: 'mod' }) }) });
      const result = await service.updateRole('1', 'mod');
      expect(result).toEqual({ _id: '1', username: 'a', role: 'mod' });
    });
    it('should return null if not found', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) });
      const result = await service.updateRole('1', 'mod');
      expect(result).toBeNull();
    });
  });

  describe('invalidatePassword', () => {
    it('should update password to "!" and return user', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '1', username: 'a', role: 'user' }) }) });
      const result = await service.invalidatePassword('1');
      expect(result).toEqual({ _id: '1', username: 'a', role: 'user' });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('1', { password: '!' }, { new: true });
    });
    it('should return null if not found', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) });
      const result = await service.invalidatePassword('1');
      expect(result).toBeNull();
    });
  });
});
