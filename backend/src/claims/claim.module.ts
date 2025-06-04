import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Claim, ClaimSchema } from './claim.schema';
import { ClaimService } from './claim.service';
import { ClaimController } from './claim.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
  ],
  providers: [ClaimService],
  controllers: [ClaimController],
})
export class ClaimModule {}
