import { IsMongoId, IsInt, Min, Max } from 'class-validator';

export class CreateOrUpdateRatingDto {
  @IsMongoId()
  readonly articleId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  readonly value: number;
}