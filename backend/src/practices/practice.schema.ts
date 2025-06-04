import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PracticeDocument = HydratedDocument<Practice>;

@Schema()
export class Practice {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: true })
  valid: boolean;
}

export const PracticeSchema = SchemaFactory.createForClass(Practice);
