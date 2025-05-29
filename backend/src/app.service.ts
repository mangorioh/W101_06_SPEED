import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './schemas/article.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async findAll() {
    return this.articleModel
      .find()
      .select(
        'title author published_date publisher status description isbn moderatedBy rating reason_for_decision volume number journal updated_date moderated_date',
      )
      .lean()
      .exec();
  }

  async searchArticles(query: string) {
    return this.articleModel
      .find({
        $or: [
          { title: new RegExp(query, 'i') },
          { author: new RegExp(query, 'i') },
          { publisher: new RegExp(query, 'i') },
        ],
      })
      .select(
        'title author published_date publisher status reason_for_decision',
      )
      .exec();
  }
  getHello(): string {
    return 'SPEED backend is running...';
  }
}
