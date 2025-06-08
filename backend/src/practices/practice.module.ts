import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Practice, PracticeSchema } from './practice.schema';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Practice.name, schema: PracticeSchema }]),
  ],
  providers: [PracticeService],
  controllers: [PracticeController],
})
export class PracticeModule {}