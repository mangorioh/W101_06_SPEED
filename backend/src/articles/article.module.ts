import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleService } from './article.service';
import { Article, ArticleSchema } from './article.schema';
import { ArticleController } from './article.controller';
import { ModerationModule } from 'src/moderation/moderation.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    forwardRef(() => ModerationModule)
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
