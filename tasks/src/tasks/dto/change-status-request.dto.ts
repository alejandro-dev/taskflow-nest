import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ChangeStatusDto } from './change-status.dto';

export class ChangeStatusRequestDto {
   @IsNotEmpty()
   @Type(() => ChangeStatusDto)
   changeStatusDto: ChangeStatusDto;

   @IsString()
   @IsNotEmpty()
   requestId: string;

   @IsString()
   @IsNotEmpty()
   @Matches(/^[0-9a-fA-F]{24}$/, { message: 'authorId must be a valid MongoDB ObjectId' })
   userId: string;
}
