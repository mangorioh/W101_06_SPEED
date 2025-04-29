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
  } from '@nestjs/common';

import { ModerationService } from './moderation.service';
import { ModerationDecisionDto } from './moderation-decision.dto';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue')
  getPendingArticles() {
    //return "I'm jakeing it";
    return this.moderationService.getPendingArticles();
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
}