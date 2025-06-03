import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './article.schema';
import { CreateArticleDto } from './create-article.dto';
import { UpdateArticleDto } from './update-article.dto';
import { ModerationService } from 'src/moderation/moderation.service';

@Injectable()
export class ArticleService {
  reject() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @Inject(forwardRef(() => ModerationService))
    private moderationService: ModerationService,
  ) {}

  //Run create DTO
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const newArticle = new this.articleModel(createArticleDto);

    // Check for a duplicate article
    const duplicate = await this.articleModel.findOne(
      {
        _id: { $ne: newArticle._id },
        DOI: createArticleDto.DOI,
      }
    )

    if (duplicate != null) {
      //console.log(duplicate.DOI);

      if (duplicate.DOI === newArticle.DOI) {
        //console.log("Duplicate found");

        const rejectArticle = new this.articleModel(createArticleDto);
        rejectArticle.status = 'removed';

        // If an article is already there
        return rejectArticle.save();
      }
      //console.log(duplicate._id);
    }

    // If article is not a dupe
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
  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article | null> {
    return this.articleModel
      .findByIdAndUpdate(id, updateArticleDto, { new: true })
      .exec();
  }
}
