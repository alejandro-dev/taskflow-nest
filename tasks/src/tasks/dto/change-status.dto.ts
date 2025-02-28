import { IsString } from "class-validator";

export class ChangeStatusDto {
   @IsString()
   id: string;

   @IsString()
   status: string;
}