import { IsString, Matches } from "class-validator";

export class AssignAuthorDto {
   @IsString()
   id: string;

   @Matches(/^[0-9a-fA-F]{24}$/, { message: 'assignedTo must be a valid MongoDB ObjectId' })
   assignedTo?: string;
}