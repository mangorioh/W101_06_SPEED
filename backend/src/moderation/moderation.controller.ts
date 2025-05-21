import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    NotFoundException,
    Patch,
  } from '@nestjs/common';

import { ModerationService } from './moderation.service';
import { ModerationDecisionDto } from './moderation-decision.dto';
import { RejectArticleDto } from './reject-article.dto';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue')
  getPendingArticles() {
    //return "Test for Pending";
    return this.moderationService.getPendingArticles();
  }

  @Get('rejects')
  getRejectedArticles() {
    return this.moderationService.getRejectedArticles();
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
  rejectArticle(
    @Param('id') id: string,
    @Body() rejectDto: RejectArticleDto
  ) {
    return this.moderationService.rejectArticle(
      id,
      rejectDto.rejectionReason,
      rejectDto.moderator,
    )
  }
}