import { IsDateString, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    assignedTo: string;

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
