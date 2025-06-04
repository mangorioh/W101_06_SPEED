import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Helper to mock chainable mongoose methods
const execMock = (result: any) => jest.fn().mockReturnValue(Promise.resolve(result));
const selectMock = (result: any) => ({ exec: execMock(result) });

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      constructor: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: userModel,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if username exists', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockReturnValue(Promise.resolve({})) });
      await expect(service.create('test', 'pw')).rejects.toThrow(ConflictException);
    });
    it('should hash password and return safe fields', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockReturnValue(Promise.resolve(null)) });
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedpw');
      const newUser = {
        _id: '1',
        username: 'test',
        role: 'user',
        save: jest.fn().mockResolvedValue({ _id: '1', username: 'test', role: 'user' }),
      };
      userModel.constructor = jest.fn(() => newUser);
      const origUserModel = service['userModel'];
      service['userModel'] = function (data: any) { return newUser; } as any;
      const result = await service.create('test', 'pw');
      expect(result).toEqual({ _id: '1', username: 'test', role: 'user' });
    });
  });

  describe('findOne', () => {
    it('should return user without password', async () => {
      const user = { _id: '1', username: 'test', role: 'user' };
      userModel.findOne.mockReturnValue({ select: selectMock(user) });
      const result = await service.findOne('test');
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [{ _id: '1', username: 'a', role: 'user' }];
      userModel.find.mockReturnValue({ select: selectMock(users) });
      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const user = { _id: '1', username: 'a', role: 'user' };
      userModel.findById.mockReturnValue({ select: selectMock(user) });
      const result = await service.findById('1');
      expect(result).toEqual(user);
    });
  });

  describe('updateRole', () => {
    it('should return updated user', async () => {
      const user = { _id: '1', username: 'a', role: 'mod' };
      userModel.findByIdAndUpdate.mockReturnValue({ select: selectMock(user) });
      const result = await service.updateRole('1', 'mod');
      expect(result).toEqual(user);
    });
  });

  describe('deleteById', () => {
    it('should return { deleted: true } if deleted', async () => {
      userModel.deleteOne.mockReturnValue({ exec: execMock({ deletedCount: 1 }) });
      const result = await service.deleteById('1');
      expect(result).toEqual({ deleted: true });
    });
    it('should return { deleted: false } if not deleted', async () => {
      userModel.deleteOne.mockReturnValue({ exec: execMock({ deletedCount: 0 }) });
      const result = await service.deleteById('1');
      expect(result).toEqual({ deleted: false });
    });
  });

  /*describe('invalidatePassword', () => {
    it('should return user after invalidation', async () => {
      const user = { _id: '1', username: 'a', role: 'user' };
      userModel.findByIdAndUpdate.mockReturnValue({ select: selectMock(user) });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpw' as any);
      const result = await service.invalidatePassword('1');
      expect(result).toEqual(user);
    });
  });*/
});
