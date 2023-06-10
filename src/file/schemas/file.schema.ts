import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type FileDocument = HydratedDocument<File>;

@Schema()
export class File {
  @Prop()
  name: string;

  @Prop()
  size: number;

  @Prop()
  type: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  user_id: User;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'File'})
  parent_id: File;

  @Prop()
  access_link: string;
}

export const FileSchema = SchemaFactory.createForClass(File);