import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignUserDto } from './assign-user.dto';
import { UUID } from 'crypto';

export class AssignUserRequestDto {
   @IsNotEmpty()
   @Type(() => AssignUserDto)
   assignUserDto: AssignUserDto;

   @IsString()
   @IsNotEmpty()
   id: UUID;

   @IsString()
   @IsNotEmpty()
   requestId: string;

   @IsString()
   @IsNotEmpty()
   @Matches(/^[0-9a-fA-F]{24}$/, { message: 'authorId must be a valid MongoDB ObjectId' })
   userId: string;
}
