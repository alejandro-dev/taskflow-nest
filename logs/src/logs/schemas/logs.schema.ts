import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({ timestamps: true, versionKey: false })
export class Log extends Document {
   @Prop({ required: true })
   level: string;

   @Prop({ required: true })
   message: string;

   @Prop({ required: true })
   request_id: string;

   @Prop({ required: true })
   user_id: string;

   @Prop({ required: true })
   event_type: string;

   @Prop({ required: true })
   service_name: string;

   @Prop({ required: false, type: MongooseSchema.Types.Mixed })
   details?: any;
}

export const LogSchema = SchemaFactory.createForClass(Log);
