import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTaskDto } from './create-task.dto';

export class CreateTaskRequestDto {
   @IsNotEmpty()
   @Type(() => CreateTaskDto)
   createTaskDto: CreateTaskDto;

   @IsString()
   @IsNotEmpty()
   @Matches(/^[0-9a-fA-F]{24}$/, { message: 'authorId must be a valid MongoDB ObjectId' })
   requestId: string;
}
