// <(~)
//  ( )>    chicken
//  | |
//  < <

import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './article.schema';
import { CreateArticleDto } from './create-article.dto';
import { UpdateArticleDto } from './update-article.dto';

describe('ArticleService', () => {
  let service: ArticleService;

  const mockArticle = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Article Title',
    volume: '42',
    number: 2,
    journal: 'Journal of Testing',
    isbn: '978-3-16-148410-0',
    author: ['Alice Smith', 'Bob Johnson'],
    description: 'This article explores the science of testing.',
    DOI: '10.1234/example.doi',
    URL: 'https://example.com/article',
    published_date: new Date('2023-10-01'),
    publisher: 'Test Publisher',
    submitter: 'Test Submitter',
    updated_date: new Date('2023-10-02'),
    status: 'pending',
    moderatedBy: 'Moderator Name',
    moderated_date: new Date('2023-10-03'),
    reason_for_decision: 'Well-written and relevant.',
    rating: 4.5,
    practice: ['Testing', 'Documentation'],
  };

  // Create a dynamic mock model
  const mockArticleModel = function (dto: any) {
    return {
      ...dto,
      save: jest.fn().mockResolvedValue(mockArticle),
    };
  };

  // Add static Mongoose methods
  mockArticleModel.find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockArticle]),
  });

  mockArticleModel.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockArticle),
  });

  mockArticleModel.findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockArticle),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getModelToken(Article.name),
          useValue: mockArticleModel,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new article', async () => {
      const createDto: CreateArticleDto = {
          title: 'Test Article Two',
          volume: '42',
          number: 2,
          journal: 'Journal of Testing',
          isbn: '978-3-16-148410-0',
          author: ['Alice Smith', 'Bob Johnson'],
          description: 'This article explores the science of testing.',
          DOI: '10.1234/example.doi',
          URL: 'https://example.com/article',
          published_date: new Date('2023-10-01'),
          publisher: 'Test Publisher',
          submitter: 'Test Submitter',
          updated_date: new Date('2023-10-02'),
          status: 'pending',
          moderatedBy: 'Moderator Name',
          moderated_date: new Date('2023-10-03'),
          reason_for_decision: 'Well-written and relevant.',
          rating: 4.5,
          practice: ['Testing', 'Documentation'],
          rating_sum: 0,
          rating_count: 0
      };

      const result = await service.create(createDto);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('findAll', () => {
    it('should return all articles', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockArticle]);
      expect(mockArticleModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return article by ID', async () => {
      const result = await service.findById('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockArticle);
      expect(mockArticleModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('update', () => {
    it('should update and return the article', async () => {
      const updateDto: UpdateArticleDto = { title: 'Updated Title' };
      const result = await service.update('507f1f77bcf86cd799439011', updateDto);
      expect(result).toEqual(mockArticle);
      expect(mockArticleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true }
      );
    });
  });

  describe('reject', () => {
    it('should throw "Method not implemented."', () => {
      expect(() => service.reject()).toThrowError('Method not implemented.');
    });
  });
});