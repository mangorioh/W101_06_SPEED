import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClaimDocument = HydratedDocument<Claim>;

@Schema()
export class Claim {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: true })
  valid: boolean;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
