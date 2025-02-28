import { IsDateString, IsOptional, IsString, IsUUID, Matches } from "class-validator";

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @Matches(/^[0-9a-fA-F]{24}$/, { message: 'assignedTo must be a valid MongoDB ObjectId' })
    @IsOptional()
    assignedTo?: string;

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
