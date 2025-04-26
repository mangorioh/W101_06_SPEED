import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './article.schema';
import { Article as ArticleDocument } from './article.schema'; 

@Injectable()
export class ArticleService {
  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) {}

  async findAllPending(): Promise<Article[]> {
    return this.articleModel.find({ status: 'pending' }).exec();
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    return article;
  }

  async moderate(id: string, decision: 'accept' | 'reject', moderatorId?: string): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    article.status = decision;
    article.moderated_date = new Date();
    if (moderatorId) {
      article.moderatedBy = moderatorId;
    }

    return article.save();
  }
}
