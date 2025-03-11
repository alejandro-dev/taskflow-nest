import { IsInt, IsOptional } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsInt()
    limit: number;

    @IsOptional()
    @IsInt()
    page: number;
    
}