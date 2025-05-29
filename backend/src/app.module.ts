import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ArticleModule } from './articles/article.module';
import { ArticleSchema } from './schemas/article.schema';
import { ModerationModule } from './moderation/moderation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),

    ArticleModule,
    ModerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }

