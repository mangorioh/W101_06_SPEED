import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/articles')
export class AppController {
  constructor(private readonly appService: AppService) {}
}
