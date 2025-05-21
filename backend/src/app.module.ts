import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ArticleSchema } from './schemas/article.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),

import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ArticleModule } from './articles/article.module';
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

    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }])

    ArticleModule,
    ModerationModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}


export class AppModule { }

