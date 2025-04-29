import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { ArticleModule } from '../articles/article.module';

@Module({
  imports: [ArticleModule],
  controllers: [ModerationController],
  providers: [ModerationService],
})
export class ModerationModule {}
