import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTaskDto } from './create-task.dto';

export class CreateTaskRequestDto {
   @IsNotEmpty()
   @Type(() => CreateTaskDto)
   createTaskDto: CreateTaskDto;

   @IsString()
   @IsNotEmpty()
   requestId: string;
}
