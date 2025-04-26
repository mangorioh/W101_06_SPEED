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
import { ArticleService } from './article.service';

@Controller('moderation')
export class ArticleController {
constructor(private readonly articleService: ArticleService) {}

@Get('queue')
async getQueue() {
    return this.articleService.findAllPending();
}

@Get('article/:id')
async getArticle(@Param('id') id: string) {
    return this.articleService.findOne(id);
}

@Post('article/:id/decision')
async moderateArticle(
    @Param('id') id: string,
    @Body() body: { decision: 'accept' | 'reject' }
) {
    const { decision } = body;
    if (!['accept', 'reject'].includes(decision)) {
    throw new NotFoundException(`Invalid decision value: ${decision}`);
    }

    return this.articleService.moderate(id, decision);
}
}