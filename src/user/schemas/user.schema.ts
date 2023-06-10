import { File } from './../../file/schemas/file.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({type: String, required: true, unique: true})
  email: string;

  @Prop({type: String, required: true})
  password: string;

  @Prop({type: Number, default: 1024**3*10})
  diskSpace: number;

  @Prop({type: Number, default: 0})
  usedSpace: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }] })
  files: File[]
}

export const UserSchema = SchemaFactory.createForClass(User);