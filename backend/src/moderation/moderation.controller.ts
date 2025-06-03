import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';

import { ModerationService } from './moderation.service';
import { ModerationDecisionDto } from './moderation-decision.dto';
import { RejectArticleDto } from './reject-article.dto';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue')
  getPendingArticles() {
    return this.moderationService.getPendingArticles();
  }

  @Get('rejects')
  getRejectedArticles() {
    return this.moderationService.getRejectedArticles();
  }

  @Get('removed')
  getRemovedArticles() {
    return this.moderationService.getRemovedArticles();
  }

  @Post('article/:id/decision')
  moderateArticle(
    @Param('id') id: string,
    @Body() moderationDecisionDto: ModerationDecisionDto,
  ) {
    return this.moderationService.moderateArticle(
      id,
      moderationDecisionDto.decision,
      moderationDecisionDto.moderator,
    );
  }

  @Patch(':id/reject')
  rejectArticle(@Param('id') id: string, @Body() rejectDto: RejectArticleDto) {
    return this.moderationService.rejectArticle(
      id,
      rejectDto.rejectionReason,
      rejectDto.moderator,
    );
  }

  @Patch(':id/remove')
  removeArticle(@Param('id') id: string) {
    return this.moderationService.removeArticle(id);
  }
}
