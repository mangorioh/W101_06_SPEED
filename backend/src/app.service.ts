import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './articles/article.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}
}
