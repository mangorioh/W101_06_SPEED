import { Injectable } from '@nestjs/common';
import { ArticleService } from '../articles/article.service';

@Injectable()
export class ModerationService {
  constructor(private readonly articleService: ArticleService) {}

  //Get all articles with status 'pending'
  async getPendingArticles() {
    const allArticles = await this.articleService.findAll();
    return allArticles.filter((article) => article.status === 'pending');
  }

  //Get all rejected articles
  async getRejectedArticles() {
    const allArticles = await this.articleService.findAll();
    const rejected_articles = allArticles.filter(
      (article) => article.status === 'rejected',
    );
    return rejected_articles;
  }

  //Change article's (by id) mod stat, plus add moderation date and moderator
  async moderateArticle(
    id: string,
    decision: 'accepted' | 'under moderation',
    moderator: string,
  ) {
    return this.articleService.update(id, {
      status: decision,
      moderatedBy: moderator,
      moderated_date: new Date(),
      rating: 0,
    });
  }

  //Article Rejection
  async rejectArticle(id: string, reason: string, moderator: string) {
    return this.articleService.update(id, {
      status: 'rejected',
      reason_for_decision: reason,
      moderatedBy: moderator,
      moderated_date: new Date(),
      rating: 0,
    });
  }
}
