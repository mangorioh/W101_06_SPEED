import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'articles' })
export class Article extends Document {
  @Prop()
  title: string;

  @Prop()
  isbn: string;

  @Prop()
  author: string;

  @Prop()
  published_date: Date;

  @Prop()
  description: string;

  @Prop()
  publisher: string;

  @Prop()
  status: string;

  @Prop()
  reason_for_decision?: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
