import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ArticleService } from '../articles/article.service';

@Injectable()
export class ModerationService {
  constructor(
    @Inject(forwardRef(() => ArticleService))
    private readonly articleService: ArticleService
  ) { }

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

  //Get all removed articles
  async getRemovedArticles() {
    const allArticles = await this.articleService.findAll();
    const removed_articles = allArticles.filter(
      (article) => article.status === 'removed',
    );
    return removed_articles;
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

  async removeArticle(id: string) {
    return this.articleService.update(id, {
      status: 'removed',
    });
  }

  // Get all articles where the submitter matches a given string
  async getArticlesBySubmitter(submitter: string) {
    return this.articleService.findBySubmitter(submitter);
  }
}
