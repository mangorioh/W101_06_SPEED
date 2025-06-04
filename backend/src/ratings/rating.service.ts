import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Article, ArticleDocument } from '../articles/article.schema';
import { Rating, RatingDocument } from './rating.schema';
import { CreateOrUpdateRatingDto } from './rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private readonly ratingModel: Model<RatingDocument>,
    @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>,
  ) {}

  /**
   * Create or update a user's rating for a given article.
   */
  async createOrUpdateRating(
    userId: string,
    dto: CreateOrUpdateRatingDto,
  ): Promise<{ averageRating: number; ratingCount: number }> {
    const { articleId, value } = dto;

    // ensure if article exists
    const article = await this.articleModel.findById(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // check if rating already exists
    const existing = await this.ratingModel.findOne({
      article: articleId,
      user: userId,
    });

    if (existing) {
      // update rating
      const diff = value - existing.value;
      existing.value = value;
      existing.updatedAt = new Date();
      await existing.save();

      // adjust article sum
      article.ratingSum += diff;
      await article.save();
    } else {
      // create new rating
      await this.ratingModel.create({
        article: articleId,
        user: userId,
        value,
      });

      article.ratingSum += value;
      article.ratingCount += 1;
      await article.save();
    }

    return {
      averageRating: article.ratingCount === 0 ? 0 : article.ratingSum / article.ratingCount,
      ratingCount: article.ratingCount,
    };
  }

  async findUserRating(articleId: string, userId: string): Promise<number | null> {
    const existing = await this.ratingModel.findOne({
      article: articleId,
      user: userId,
    });
    return existing ? existing.value : null;
  }

  async getArticleRatingInfo(articleId: string): Promise<{
    averageRating: number;
    ratingCount: number;
  }> {
    const article = await this.articleModel.findById(articleId).select('ratingSum ratingCount');
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return {
      averageRating: article.ratingCount === 0 ? 0 : article.ratingSum / article.ratingCount,
      ratingCount: article.ratingCount,
    };
  }

  
}
