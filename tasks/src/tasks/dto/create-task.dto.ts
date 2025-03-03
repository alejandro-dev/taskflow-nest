import { IsDateString, IsOptional, IsString, Matches } from "class-validator";

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'authorId must be a valid MongoDB ObjectId' })
    authorId: string; 

    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'assignedUserId must be a valid MongoDB ObjectId' })
    @IsOptional()
    assignedUserId?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsString()
    @IsOptional()
    status?: string;
    
    @IsString() 
    @IsOptional()
    priority?: string;
}
