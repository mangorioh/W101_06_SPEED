import { Controller, Put, Get, Body, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateOrUpdateRatingDto } from './rating.dto';
import { register } from 'module';
import { Roles } from 'src/auth/roles.decorator';

@Controller('articles/:articleId/rating')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

    // Get the current user's rating for an article
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @Roles('user', 'mod', 'owner')
    async getUserRating(
        @Param('articleId') articleId: string,
        @Req() req: any
    ) {
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.ratingService.findUserRating(articleId, userId);
    }

    // Create or update the current user's rating for an article
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put()
    @Roles('user', 'mod', 'owner')
    async createOrUpdate(
        @Param('articleId') articleId: string,
        @Body('value', ParseIntPipe) value: number,
        @Req() req: any
    ) {
        // Get userId from JWT-authenticated request
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.ratingService.createOrUpdateRating(userId, { articleId, value });
    }

    // Get the summary (average and count) of ratings for an article
    @Get('summary')
    async getSummary(@Param('articleId') articleId: string) {
        return this.ratingService.getArticleRatingInfo(articleId);
    }
}