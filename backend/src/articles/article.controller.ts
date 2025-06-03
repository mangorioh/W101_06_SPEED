import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { ArticleService } from './article.service';
import { CreateArticleDto } from './create-article.dto';
import { UpdateArticleDto } from './update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @Roles('user', 'mod', 'owner')
  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findById(id);
  }
  @Roles('mod', 'owner')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(id, updateArticleDto);
  }
}
