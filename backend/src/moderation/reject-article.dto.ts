import { IsNotEmpty, IsString } from 'class-validator';

export class RejectArticleDto {
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required' })
  rejectionReason: string;

  @IsString()
  @IsNotEmpty({ message: 'Moderator ID is required' })
  moderator: string;
}
