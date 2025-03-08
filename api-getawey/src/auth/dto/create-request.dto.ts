import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

export class CreateRequestDto {
   @IsNotEmpty()
   createUserDto: CreateUserDto;

   @IsString()
   @IsNotEmpty()
   requestId: string;
}
