import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleService } from './article.service';
import { Article, ArticleSchema } from './article.schema';
import { ArticleController } from './article.controller';
import { ModerationModule } from 'src/moderation/moderation.module';
import { RatingController } from 'src/ratings/rating.controller';
import { Rating, RatingSchema } from 'src/ratings/rating.schema';
import { RatingService } from 'src/ratings/rating.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    forwardRef(() => ModerationModule)

    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),

  ],
  controllers: [ArticleController, RatingController],
  providers: [ArticleService, RatingService],
  exports: [ArticleService],
})
export class ArticleModule {}
