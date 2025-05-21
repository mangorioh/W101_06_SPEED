import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateArticleDto } from './articles/create-article.dto';
import { error } from 'console';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/')
  async addArticle(@Body()createArticleDto: CreateArticleDto) {
    try {
      await this.appService.create(createArticleDto);
      return { message: 'Article added successfully'}
    } catch {
      throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Unable to add this article',
      },
      HttpStatus.BAD_REQUEST,
      { cause: error },
      );
    }
  }
}
