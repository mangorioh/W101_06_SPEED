import { Test, TestingModule } from '@nestjs/testing';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { RejectArticleDto } from './reject-article.dto';
import { NotFoundException } from '@nestjs/common';

describe('ModerationController', () => {
  let controller: ModerationController;
  let service: Partial<Record<keyof ModerationService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      rejectArticle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModerationController],
      providers: [
        { provide: ModerationService, useValue: service },
      ],
    }).compile();

    controller = module.get<ModerationController>(ModerationController);
  });

  describe('rejectArticle', () => {
    it('should reject an article with reason and moderator', async () => {
      const id = 'abc123';
      const dto: RejectArticleDto = {
        rejectionReason: 'Low-quality study',
        moderator: 'mod456',
      };

      const expectedResult = {
        _id: id,
        status: 'rejected',
        rejectionReason: dto.rejectionReason,
        moderatedBy: dto.moderator,
        moderated_date: new Date(),
        rating: 0,
      };

      service.rejectArticle!.mockResolvedValue(expectedResult);

      const result = await controller.rejectArticle(id, dto);

      expect(service.rejectArticle).toHaveBeenCalledWith(
        id,
        dto.rejectionReason,
        dto.moderator,
      );

      expect(result).toEqual(expectedResult);
    });;
  });
});
