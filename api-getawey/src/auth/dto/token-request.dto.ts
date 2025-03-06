import { IsNotEmpty, IsString } from 'class-validator';

export class TokenRequestDto {
   @IsString()
   @IsNotEmpty()
   token: string;

   @IsString()
   @IsNotEmpty()
   requestId: string;
}
