import { IsNotEmpty, IsString } from 'class-validator';
import { LoginUserDto } from './login-user.dto'; // Asegúrate de importar tu DTO de login
import { Type } from 'class-transformer';

export class LoginRequestDto {
   @IsNotEmpty()
   loginUserDto: LoginUserDto;

   @IsString()
   @IsNotEmpty()
   requestId: string;
}
