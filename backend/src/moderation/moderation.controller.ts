import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { ModerationService } from './moderation.service';
import { ModerationDecisionDto } from './moderation-decision.dto';
import { RejectArticleDto } from './reject-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) { }

  @Roles('mod', 'owner')
  @Get('queue')
  getPendingArticles() {
    return this.moderationService.getPendingArticles();
  }

  @Roles('mod', 'owner')
  @Get('rejects')
  getRejectedArticles() {
    return this.moderationService.getRejectedArticles();
  }

  @Roles('mod', 'owner')
  @Get('removed')
  getRemovedArticles() {
    return this.moderationService.getRemovedArticles();
  }

  @Roles('mod', 'owner')
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

  @Roles('mod', 'owner')
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

  @Roles('user', 'mod', 'owner')
  @Get('by-submitter/:submitter')
  getArticlesBySubmitter(@Param('submitter') submitter: string) {
    return this.moderationService.getArticlesBySubmitter(submitter);
  }
}
