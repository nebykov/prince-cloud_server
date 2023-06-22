import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type FileDocument = HydratedDocument<File>;

@Schema()
export class File {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({type: String, default: 'Home'})
  name: string;

  @Prop({type: String, required: true})
  type: string;

  @Prop()
  access_link: string;

  @Prop({type: Number, default: 0})
  size: number;

  @Prop({type: String, default: ''})
  path: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  user_id: User;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'File'})
  parent_id: File;

  @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'File'}]})
  childs: File[]

  @Prop({type: Date, default: Date.now()})
  date: Date
}

export const FileSchema = SchemaFactory.createForClass(File);