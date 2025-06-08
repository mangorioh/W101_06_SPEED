import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RatingDocument = HydratedDocument<Rating>;

@Schema()
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'Article', required: true })
  article: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  value: number;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

RatingSchema.index({ article: 1, user: 1 }, { unique: true });