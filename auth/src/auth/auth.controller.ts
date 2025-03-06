import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { TokenRequestDto } from './dto/token-request.dto';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * 
     * @description Healthcheck endpoint to check if the service is up and running
     * @messagePattern auth.healt
     */
    @MessagePattern('auth.healt')
    healt() {
        return { status: 'success' };
    }

    /**
     * 
     * @messagePattern auth.create
     * @param createRequestDto  - The user data to create a new user with the request id
     * @param createRequestDto.requestId - The request id
     * @param createRequestDto.createUserDto  - The user data to create a new user
     * @param createRequestDto.createUserDto.email - The email of the user
     * @param createRequestDto.createUserDto.password - The password of the user
     * 
     * @description Create a new user
     * @description Send the request to the auth service
     * @description The auth service will handle the request and return the response
     * 
     * @returns {Promise<any>} The response contain the operation status and the created user
     * 
     * @example
     * // Example success response
     * statusCode: 200
     * {
     *     "status": "success",
     * 	   "token": "eyjdslkjdfl...",
     *     "user": {
     *       "email": "alex@gmail.com",
     *       "_id": "67b70370e5bb2f15a98aaf78",
     *     }    
     * }
     * @example
     * // Example bad request response
     * statusCode: 400
     * {
     *     "message": "Your request is invalid",
     * 	   "status": "fail",
     *     "details": [
     *         "password is not strong enough",
     *         "password must be a string"        
     *     ],   
     * }
     * 
     * @example 
     * // User already exists response
     * statusCode: 400  
     * {
     *     "message": "User already exists",
     * 	   "status": "fail",
     * }
     * 
     * @example
     * // Internal Server Error response
     * statusCode: 500  
     * {
     *     "message": "Internal Server Error",
     *     "status": 'error',   
     * }
     */
    @MessagePattern('auth.create')
    async create(@Payload() createRequestDto: CreateRequestDto): Promise<any> {
        try {
            return this.authService.create(createRequestDto);

        } catch (error) {
            return error;
        }
    }

    /**
     * 
     * @messagePattern auth.verify-account 
     * @description Verify the account
     * @param verifyAccountRequestDto - The token to verify with the request id
     * @param verifyAccountRequestDto.requestId - The request id
     * @param verifyAccountRequestDto.token - The token to verify
     * @returns {Promise<any>} The response contain the operation status and the user
     * @example
     * // Example success response
     * statusCode: 200  
     * {    
     *     "status": "success",
     * 	   "message": "Account verified"
     * }
     * 
     * @example
     * // User already active response
     * statusCode: 404  
     * {
     *     "message": "User already active",
     * 	   "status": "fail",
     *  }
     * 
     * @example
     * // Internal Server Error response
     * statusCode: 500  
     * {
     *     "message": "Internal Server Error",
     *     "status": 'error',   
     * }
     */
    @MessagePattern({ cmd: 'auth.verify-account' })
    verifyAccount(@Payload() tokenRequestDto: TokenRequestDto): Promise<any> {
        try {
            return this.authService.verifyAccount(tokenRequestDto);
            
        } catch (error) {
            return error;
        }
    }

    /**
     * @messagePattern auth.login
     * 
     * @param loginRequestDto - The user data to login a user with the request id
     * @param loginRequestDto.requestId - The request id
     * @param loginRequestDto.loginUserDto - The user data to login a user
     * @param loginRequestDto.loginUserDto.email - The email of the user
     * @param loginRequestDto.loginUserDto.password - The password of the user
     * 
     * @description Login a user
     * @description Send the request to the auth service
     * @description The auth service will handle the request and return the response
     * 
     * @returns {Promise<any>} The response contain the operation status and the login user
     * 
     * @example
     * // Example success response
     * statusCode: 200  
     * {
     *     "status": "success",
     * 	   "token": "eyjdslkjdfl...",
     *     "user": {
     *       "email": "alex@gmail.com",
     *       "_id": "67b70370e5bb2f15a98aaf78",      
     *     }    
     * }
     * @example
     * // Example bad request response
     * statusCode: 400  
     *  {
     *     "message": "Your request is invalid",
     * 	   "status": "fail",
     *     "details": [
     *         "password is not strong enough",
     *         "password must be a string"  
     *     ],   
     *  }
     * 
     * @example
     * // Email or password incorrect response
     * statusCode: 400  
     * {
     *     "message": "Email or password incorrect",
     * 	   "status": "fail",
     *  }
     * 
     * @example
     * // Internal Server Error response
     * statusCode: 500  
     * {
     *     "message": "Internal Server Error",
     *     "status": 'error',   
     * }
     *
     */
    @MessagePattern({ cmd: 'auth.login' })
    async login(@Payload() loginRequestDto: LoginRequestDto): Promise<any> {
        try {
            return this.authService.login(loginRequestDto);

        } catch (error) {
            return error;
        }
    }

    /**
     * 
     * @messagePattern auth.verify-token 
     * @description Verify the token
     * @param token - The token to verify
     * @returns {Promise<any>} The response contain the operation status and the user
     * @example
     * // Example success response
     * statusCode: 200  
     * {    
     *     "status": "success",
     * 	   "token": "eyjdslkjdfl...",
     *     "user": {
     *       "email": "alex@gmail.com",
     *       "_id": "67b70370e5bb2f15a98aaf78",
     *     }
     * }
     */
    @MessagePattern('auth.verify-token')
    verifyToken(@Payload("token") token: string): Promise<any> {
        try {
            return this.authService.verifyToken(token);
            
        } catch (error) {
            return error;
        }
    }

}
