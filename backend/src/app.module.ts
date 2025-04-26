import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ArticleModule } from './articles/article.module';

let DB = "mongodb+srv://czf8591:JUZvqhumub7AF7q0@cluster0.wlyodt5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_URI ?? DB), 
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
