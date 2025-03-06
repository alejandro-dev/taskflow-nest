import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

export class CreateRequestDto {
   @IsNotEmpty()
   @Type(() => CreateUserDto)
   createUserDto: CreateUserDto;

   @IsString()
   @IsNotEmpty()
   requestId: string;
}
