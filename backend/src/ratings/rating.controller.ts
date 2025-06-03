import { Controller, Post, Put, Get, Body, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateOrUpdateRatingDto } from './rating.dto';

@Controller('articles/:articleId/rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get()
  // qrq1356
  async getUserRating(@Param('articleId') articleId: string/*, @Req() req*/) {
    // qrq1356
    const userId = 'MOCK_USER_ID';
    return this.ratingService.findUserRating(articleId, userId);
  }

  @Put()
  // qrq1356
  async createOrUpdate(
    @Param('articleId') articleId: string,
    // qrq1356
    @Body('value', ParseIntPipe) value: number,
  ) {
    // qrq1356
    const userId = 'MOCK_USER_ID';
    return this.ratingService.createOrUpdateRating(userId, { articleId, value });
  }

  @Get('summary')
  async getSummary(@Param('articleId') articleId: string) {
    return this.ratingService.getArticleRatingInfo(articleId);
  }
}