import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
export type UserRole = 'user' | 'mod' | 'owner';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // hashed

  @Prop({ type: String, enum: ['user', 'mod', 'owner'], default: 'user' })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hide password in all outputs
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});
