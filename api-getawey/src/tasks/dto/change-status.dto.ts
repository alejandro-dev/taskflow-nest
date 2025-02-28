import { IsString } from "class-validator";

export class ChangeStatusDto {
   @IsString()
   status: string;
}