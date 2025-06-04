// src/practice/__tests__/practice.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { PracticeService } from './practice.service';
import { Practice } from './practice.schema';

type MockPractice = {
  _id: string;
  name: string;
  valid: boolean;
  save: () => Promise<any>;
};

describe('practiceService', () => {
  let service: PracticeService;

  const mockModelMethods: any = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  let MockPracticeModel: jest.Mock;

  // fake data
  const mockItems: MockPractice[] = [
    { _id: '1', name: 'practice one', valid: true, save: jest.fn() },
    { _id: '2', name: 'practice two', valid: false, save: jest.fn() },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    MockPracticeModel = jest.fn().mockImplementation((dto: Partial<Practice>) => {
      const instance: MockPractice = {
        _id: 'new-id',
        name: dto.name!, // non-null assertion
        valid: dto.valid ?? true,
        save: jest.fn().mockResolvedValue({
          _id: 'new-id',
          name: dto.name!,
          valid: dto.valid ?? true,
        }),
      };
      return instance;
    });

    Object.assign(MockPracticeModel, mockModelMethods);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeService,
        {
          provide: getModelToken(Practice.name),
          useValue: MockPracticeModel,
        },
      ],
    }).compile();

    service = module.get<PracticeService>(PracticeService);
  });

  describe('findAll', () => {
    it('should return a list of practices', async () => {
      mockModelMethods.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockItems),
      });

      const result = await service.findAll();
      expect(mockModelMethods.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockItems);
    });
  });

  describe('findOne', () => {
    it('should return a single practice if it exists', async () => {
      const single = mockItems[0];
      mockModelMethods.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(single),
      });

      const result = await service.findOne('1');
      expect(mockModelMethods.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(single);
    });

    it('should throw notfoundexception if practice not found', async () => {
      mockModelMethods.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('doesnt-exist')).rejects.toThrow(NotFoundException);
      expect(mockModelMethods.findById).toHaveBeenCalledWith('doesnt-exist');
    });
  });

  describe('create', () => {
    it('should create a new practice with valid defaulting to true', async () => {
      const result = await service.create('new practice');
      expect(MockPracticeModel.mock.calls.length).toBe(1);
      expect(result).toEqual({ _id: 'new-id', name: 'new practice', valid: true });
    });

    it('should create a new practice with valid explicitly set to false', async () => {
      const result = await service.create('another', false);
      expect(MockPracticeModel.mock.calls.length).toBe(1);
      expect(result).toEqual({ _id: 'new-id', name: 'another', valid: false });
    });
  });

  describe('rename', () => {
    it('should update the name and return the updated practice', async () => {
      const updatedDoc = { _id: '1', name: 'renamed', valid: true };
      mockModelMethods.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await service.rename('1', 'renamed');
      expect(mockModelMethods.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'renamed' },
        { new: true },
      );
      expect(result).toEqual(updatedDoc);
    });

    it('should throw notfoundexception if the practice to rename does not exist', async () => {
      mockModelMethods.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.rename('nope', 'x')).rejects.toThrow(NotFoundException);
      expect(mockModelMethods.findByIdAndUpdate).toHaveBeenCalledWith(
        'nope',
        { name: 'x' },
        { new: true },
      );
    });
  });

  describe('setValidity', () => {
    it('should update valid flag and return the updated practice', async () => {
      const updatedDoc = { _id: '2', name: 'practice two', valid: true };
      mockModelMethods.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await service.setValidity('2', true);
      expect(mockModelMethods.findByIdAndUpdate).toHaveBeenCalledWith(
        '2',
        { valid: true },
        { new: true },
      );
      expect(result).toEqual(updatedDoc);
    });

    it('should throw notfoundexception if practice does not exist', async () => {
      mockModelMethods.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.setValidity('none', false)).rejects.toThrow(NotFoundException);
      expect(mockModelMethods.findByIdAndUpdate).toHaveBeenCalledWith(
        'none',
        { valid: false },
        { new: true },
      );
    });
  });
});
