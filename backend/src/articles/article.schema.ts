import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema()
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop()
  volume: string;

  @Prop()
  number: number;

  @Prop()
  journal: string;

  @Prop()
  isbn: string;

  @Prop({ required: true })
  author: string[];

  @Prop()
  description: string;

  @Prop()
  DOI: string;

  @Prop()
  URL: string;

  @Prop({ type: Date })
  published_date: Date;

  @Prop()
  publisher: string;

  @Prop({ type: String, default: 'Anonymous' })
  submitter: string;

  @Prop({ type: Date, default: Date.now })
  updated_date: Date;

  @Prop({
    enum: ['pending', 'under moderation', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Prop()
  moderatedBy?: string;

  @Prop({ type: Date, default: Date.now })
  moderated_date: Date;

  @Prop()
  reason_for_decision: string;

  @Prop()
  rating: number;

  @Prop()
  practice: string[];
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
