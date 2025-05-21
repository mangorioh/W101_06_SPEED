import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/articles')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getArticles(@Query('search') search: string) {
    return search 
      ? this.appService.searchArticles(search)
      : this.appService.findAll();
  }
}
