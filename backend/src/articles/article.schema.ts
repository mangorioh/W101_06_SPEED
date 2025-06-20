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
    enum: ['pending', 'under moderation', 'accepted', 'rejected', 'removed'],
    default: 'pending',
  })
  status: string;

  @Prop()
  moderatedBy?: string;

  @Prop({ type: Date, default: Date.now })
  moderated_date: Date;

  @Prop()
  reason_for_decision: string;

  @Prop({ type: Number, default: 0 })
  ratingSum: number;

  @Prop({ type: Number, default: 0 })
  ratingCount: number;

  @Prop()
  practice: string[];

  @Prop()
  claim?: string[]; 

  @Prop()
  resultOfEvidence: string;

  @Prop()
  typeOfResearch: string;

  @Prop([String])
  typeOfParticipant: string[];

  
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
