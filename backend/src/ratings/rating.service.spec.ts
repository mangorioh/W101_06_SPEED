import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

import { RatingService } from './rating.service';
import { Rating, RatingDocument } from './rating.schema';
import { Article, ArticleDocument } from './../articles/article.schema';
import { CreateOrUpdateRatingDto } from './rating.dto';

type MockModel<T = any> = Partial<Record<'findById' | 'findOne' | 'create', jest.Mock>>;

function createMockModel<T>(): MockModel<T> {
  return {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };
}

describe('RatingService (minimal unit test)', () => {
  let service: RatingService;
  let ratingModel: MockModel<RatingDocument>;
  let articleModel: MockModel<ArticleDocument>;

  beforeEach(async () => {
    ratingModel = createMockModel<RatingDocument>();
    articleModel = createMockModel<ArticleDocument>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: getModelToken(Rating.name), useValue: ratingModel },
        { provide: getModelToken(Article.name), useValue: articleModel },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new rating (when none exists) and update article sums', async () => {
    const mockUserId = new Types.ObjectId().toHexString();
    const mockArticleId = new Types.ObjectId().toHexString();
    const dto: CreateOrUpdateRatingDto = { articleId: mockArticleId, value: 4 };

    const fakeArticleDoc: any = {
      _id: mockArticleId,
      ratingSum: 10,
      ratingCount: 2,
      save: jest.fn().mockResolvedValue(undefined),
    };
    (articleModel.findById as jest.Mock).mockResolvedValue(fakeArticleDoc);

    (ratingModel.findOne as jest.Mock).mockResolvedValue(null);

    const fakeCreatedRating: any = {
      _id: new Types.ObjectId().toHexString(),
      article: mockArticleId,
      user: mockUserId,
      value: 4,
      updatedAt: new Date(),
    };
    (ratingModel.create as jest.Mock).mockResolvedValue(fakeCreatedRating);

    const result = await service.createOrUpdateRating(mockUserId, dto);

    expect(ratingModel.findOne).toHaveBeenCalledWith({
      article: mockArticleId,
      user: mockUserId,
    });
    expect(ratingModel.create).toHaveBeenCalledWith({
      article: mockArticleId,
      user: mockUserId,
      value: 4,
    });

    expect(fakeArticleDoc.ratingSum).toBe(14);
    expect(fakeArticleDoc.ratingCount).toBe(3);
    expect(fakeArticleDoc.save).toHaveBeenCalled();

    expect(result.averageRating).toBeCloseTo(14 / 3, 5);
    expect(result.ratingCount).toBe(3);
  });

  it('should throw NotFoundException if the article does not exist', async () => {
    const mockUserId = new Types.ObjectId().toHexString();
    const mockArticleId = new Types.ObjectId().toHexString();
    const dto: CreateOrUpdateRatingDto = { articleId: mockArticleId, value: 3 };

    (articleModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createOrUpdateRating(mockUserId, dto),
    ).rejects.toThrow(NotFoundException);
  });
});