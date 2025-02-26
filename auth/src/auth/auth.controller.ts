import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * 
     * @returns 
     * @description Healthcheck endpoint to check if the service is up and running
     * @messagePattern auth.healt
     */
    @MessagePattern('auth.healt')
    healt() {
        return { status: 'success' };
    }

    /**
     * 
     * @param createUserDto 
     * @returns 
     * @description Create a new user
     * @description Send the request to the auth service
     * @description The auth service will handle the request and return the response
     * @messagePattern auth.create
     * @example
     * {
     *     "email": "test@test.com",
     *     "password": "test123"
     * }
     * @example
     * {
     *     "status": "success"
     * }
     * @example
     * {
     *     "message": [
     *         "password is not strong enough",
     *         "password must be a string"
     *     ],
     *     "statusCode": 400,
     *     "error": "Bad Request",
     * }
     */
    @MessagePattern('auth.create')
    async create(@Payload() createUserDto: CreateUserDto) {
        try {
            return this.authService.create(createUserDto);

        } catch (error) {
            return error;
        }
    }

    /**
     * 
     * @param createUserDto 
     * @returns 
     * @description Create a new user
     * @description Send the request to the auth service
     * @description The auth service will handle the request and return the response
     * @messagePattern auth.create
     * @example
     * {
     *     "email": "test@test.com",
     *     "password": "test123"
     * }
     * @example
     * {
     *     "status": "success"
     * }
     * @example
     * {
     *     "message": [
     *         "password is not strong enough",
     *         "password must be a string"
     *     ],
     *     "statusCode": 400,
     *     "error": "Bad Request",
     * }
     */
    @MessagePattern('auth.login')
    async login(@Payload() loginUserDto: LoginUserDto) {
        try {
            return this.authService.login(loginUserDto);

        } catch (error) {
            return error;
        }
    }

    /**
     * 
     * @param token 
     * @returns 
     * @description Verify the token
     * @messagePattern auth.verify-token
     * @example
     * {
     *     "token": "eyjdslkjdfl...",
     *     "user": {
     *         "id": "1234567890abcdef12345678",
     *         "email": "alex@gmail.com"
     *     }
     * }
     * @example
     * {
     *     "message": "Token expired",
     *     "statusCode": 401,
     *     "error": "Unauthorized",
     * }
     */
    @MessagePattern('auth.verify-token')
    verifyToken(@Payload("token") token: string){
        return this.authService.verifyToken(token);
    }

}
