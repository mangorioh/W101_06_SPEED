import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { ArticleService } from '../articles/article.service';
import { Article } from '../articles/article.schema';

describe('ModerationService', () => {
  let moderationService: ModerationService;
  let articleService: Partial<Record<keyof ArticleService, jest.Mock>>;

  beforeEach(async () => {
    articleService = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: ArticleService, useValue: articleService },
      ],
    }).compile();

    moderationService = module.get<ModerationService>(ModerationService);
  });

  describe('rejectArticle', () => {
    it('should call articleService.update with correct data', async () => {
      const mockId = 'abc123';
      const mockReason = 'Too vague and unsupported.';
      const mockModerator = 'mod1';

      // Explicitly type the mock article to avoid 'any'
      const mockModeratedDate = new Date();
      const mockUpdatedArticle: Partial<Article> = {
        status: 'rejected',
        reason_for_decision: mockReason,
        moderatedBy: mockModerator,
        moderated_date: mockModeratedDate,
      };

      articleService.update!.mockResolvedValue(mockUpdatedArticle);

      // Let TypeScript infer the type from the method signature
      const result = await moderationService.rejectArticle(
        mockId,
        mockReason,
        mockModerator,
      );

      expect(articleService.update).toHaveBeenCalledWith(mockId, {
        status: 'rejected',
        reason_for_decision: mockReason,
        moderatedBy: mockModerator,
        moderated_date: mockModeratedDate,
        rating: 0,
      });

      expect(result).toEqual(mockUpdatedArticle);
    });
  });
});
