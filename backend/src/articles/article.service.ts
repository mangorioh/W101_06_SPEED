import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './article.schema';
import { CreateArticleDto } from './create-article.dto';
import { UpdateArticleDto } from './update-article.dto';

@Injectable()
export class ArticleService {
  constructor(@InjectModel(Article.name) private articleModel: Model<Article>) {}

  //Run create DTO
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const newArticle = new this.articleModel(createArticleDto);
    return newArticle.save();
  }

  //Find all articles
  async findAll(): Promise<Article[]> {
    return this.articleModel.find().exec();
  }

  //Find article by obj id - FIX LATER
  async findById(id: string): Promise<Article | null> {
    return this.articleModel.findById(id).exec();
  }

  //Run update DTO - FIX LATER
  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article | null> {
    return this.articleModel.findByIdAndUpdate(id, updateArticleDto, { new: true }).exec();
  }
}
