import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTaskDto } from './update-task.dto';

export class UpdateTaskRequestDto {
   @IsNotEmpty()
   updateTaskDto: UpdateTaskDto;

   @IsString()
   @IsNotEmpty()
   requestId: string;

   @IsString()
   @IsNotEmpty()
   @Matches(/^[0-9a-fA-F]{24}$/, { message: 'authorId must be a valid MongoDB ObjectId' })
   userId: string;
}
