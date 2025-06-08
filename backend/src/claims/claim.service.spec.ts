import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ClaimService } from './claim.service';
import { Claim } from './claim.schema';

type MockClaim = {
  _id: string;
  name: string;
  valid: boolean;
  save: () => Promise<any>;
};

describe('claimService', () => {
  let service: ClaimService;

  // static method stubs
  const mockModelMethods: any = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  // will hold the constructor mock
  let MockClaimModel: jest.Mock;

  // some fake claims
  const mockItems: MockClaim[] = [
    { _id: 'a1', name: 'claim a', valid: true, save: jest.fn() },
    { _id: 'b2', name: 'claim b', valid: false, save: jest.fn() },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    // constructor stub that returns an object with save()
    MockClaimModel = jest.fn().mockImplementation((dto: Partial<Claim>) => {
      const instance: MockClaim = {
        _id: 'new-claim-id',
        name: dto.name!,
        valid: dto.valid ?? true,
        save: jest.fn().mockResolvedValue({
          _id: 'new-claim-id',
          name: dto.name!,
          valid: dto.valid ?? true,
        }),
      };
      return instance;
    });

    // attach static stubs onto constructor
    Object.assign(MockClaimModel, mockModelMethods);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimService,
        {
          provide: getModelToken(Claim.name),
          useValue: MockClaimModel,
        },
      ],
    }).compile();

    service = module.get<ClaimService>(ClaimService);
  });

  describe('findAll', () => {
    it('should return a list of claims', async () => {
      mockModelMethods.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockItems),
      });

      const result = await service.findAll();
      expect(mockModelMethods.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockItems);
    });
  });

  describe('findOne', () => {
    it('should return a single claim if it exists', async () => {
      const single = mockItems[0];
      mockModelMethods.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(single),
      });

      const result = await service.findOne('a1');
      expect(mockModelMethods.findById).toHaveBeenCalledWith('a1');
      expect(result).toEqual(single);
    });

    it('should throw notfoundexception if claim not found', async () => {
      mockModelMethods.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
      expect(mockModelMethods.findById).toHaveBeenCalledWith('nope');
    });
  });

  describe('create', () => {
    it('should create a new claim with valid default true', async () => {
      const result = await service.create('new claim');
      expect(MockClaimModel.mock.calls.length).toBe(1);
      expect(result).toEqual({ _id: 'new-claim-id', name: 'new claim', valid: true });
    });

    it('should create a new claim with valid explicitly false', async () => {
      const result = await service.create('another claim', false);
      expect(MockClaimModel.mock.calls.length).toBe(1);
      expect(result).toEqual({ _id: 'new-claim-id', name: 'another claim', valid: false });
    });
  });

  describe('rename', () => {
    it('should update the name and return updated claim', async () => {
      const updatedDoc = { _id: 'a1', name: 'claim a+', valid: true };
      mockModelMethods.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await service.rename('a1', 'claim a+');
      expect(mockModelMethods.findByIdAndUpdate).toHaveBeenCalledWith(
        'a1',
        { name: 'claim a+' },
        { new: true },
      );
      expect(result).toEqual(updatedDoc);
    });

    it('should throw notfoundexception if claim to rename does not exist', async () => {
      mockModelMethods.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.rename('none', 'x')).rejects.toThrow(NotFoundException);
      expect(mockModelMethods.findByIdAndUpdate).toHaveBeenCalledWith(
        'none',
        { name: 'x' },
        { new: true },
      );
    });
  });

  describe('setValidity', () => {
    it('should update valid and return updated claim', async () => {
      const updatedDoc = { _id: 'b2', name: 'claim b', valid: true };
      mockModelMethods.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await service.setValidity('b2', true);
      expect(mockModelMethods.findByIdAndUpdate).toHaveBeenCalledWith(
        'b2',
        { valid: true },
        { new: true },
      );
      expect(result).toEqual(updatedDoc);
    });

    it('should throw notfoundexception if claim does not exist', async () => {
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
