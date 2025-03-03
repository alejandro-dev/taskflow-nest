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
     * @param createUserDto  - The user data to create a new user
     * @param createUserDto.email - The email of the user
     * @param createUserDto.password - The password of the user
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
    async create(@Payload() createUserDto: CreateUserDto): Promise<any> {
        try {
            return this.authService.create(createUserDto);

        } catch (error) {
            return error;
        }
    }

    /**
     * 
     * @messagePattern auth.verify-account 
     * @description Verify the account
     * @param token - The token to verify
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
    verifyAccount(@Payload("token") token: string): Promise<any> {
        try {
            return this.authService.verifyAccount(token);
            
        } catch (error) {
            return error;
        }
    }

    /**
     * @messagePattern auth.login
     * 
     * @param loginUserDto - The user data to login a user
     * @param loginUserDto.email - The email of the user
     * @param loginUserDto.password - The password of the user
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
    @MessagePattern('auth.login')
    async login(@Payload() loginUserDto: LoginUserDto): Promise<any> {
        try {
            return this.authService.login(loginUserDto);

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
