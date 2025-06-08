import { Module, forwardRef } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { ArticleModule } from '../articles/article.module';

@Module({
  imports: [forwardRef(() => ArticleModule)],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
