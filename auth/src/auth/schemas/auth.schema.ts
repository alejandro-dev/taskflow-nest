import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, versionKey: false })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  active: boolean;

  comparePassword: (plainPassword: string) => Promise<boolean>;

}

const UserSchema = SchemaFactory.createForClass(User);

/**
 * 
 * @description Middleware to hash the password before saving the user  
 * @description This middleware will hash the password before saving the user
 * 
**/ 
UserSchema.pre<User>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = bcrypt.genSaltSync(12);
  this.password = bcrypt.hashSync(this.password, salt);

  next();
});

/**
 * 
 * @param plainPassword 
 * @returns
 * @description Compares the plain password with the hashed password
*/
UserSchema.methods.comparePassword = function (plainPassword: string) {
  return bcrypt.compare(plainPassword, this.password);
};

export { UserSchema };

