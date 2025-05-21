import { Test, TestingModule } from '@nestjs/testing';
import { ModerationService } from './moderation.service';
import { ArticleService } from '../articles/article.service';

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

      const mockUpdatedArticle = {
        _id: mockId,
        status: 'rejected',
        rejectionReason: mockReason,
        moderatedBy: mockModerator,
        moderated_date: expect.any(Date),
        rating: 0,
      };

      articleService.update!.mockResolvedValue(mockUpdatedArticle);

      const result = await moderationService.rejectArticle(
        mockId,
        mockReason,
        mockModerator,
      );

      expect(articleService.update).toHaveBeenCalledWith(mockId, {
        status: 'rejected',
        reason_for_decision: mockReason,
        moderatedBy: mockModerator,
        moderated_date: expect.any(Date),
        rating: 0,
      });

      expect(result).toEqual(mockUpdatedArticle);
    });
  });
});
