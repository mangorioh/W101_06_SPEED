import { Injectable } from '@nestjs/common';
import { ArticleService } from '../articles/article.service';

@Injectable()
export class ModerationService {
  constructor(private readonly articleService: ArticleService) {}

  //Get all articles with status 'pending'
  async getPendingArticles() {
    const allArticles = await this.articleService.findAll();
    return allArticles.filter(article => article.status === 'pending');
  }

  //Change article's (by id) mod stat, plus add moderation date and moderator
  async moderateArticle(id: string, decision: 'accepted' | 'rejected', moderator: string) {
    return this.articleService.update(id, {
      status: decision,
      moderatedBy: moderator,
      moderated_date: new Date(),
    });
  }
}
