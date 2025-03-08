import { Controller, Get, Post, Body, Inject, HttpStatus, Param } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Services } from 'src/enums/services.enum';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoggerService } from 'src/logs/logs.service';
import { logAndHandleError } from 'src/helpers/log-helper';
import { TokenRequestDto } from './dto/token-request.dto';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('auth')
export class AuthController {
	/**
	* 
	* @param authService 
	* @description Inject the auth service to communicate with the auth service
	*/
	constructor(@Inject(Services.AUTH_SERVICE) private readonly authService: ClientProxy, private readonly loggerService: LoggerService) {}

	/**
	* 
	* @description Healthcheck endpoint to check if the service is up and running
	*/
	@Get('healt')
	healt() {
		return this.authService.send('auth.healt', {});
	} 

	/**
	 * 
	 * @route POST /auth/register
	 * @description Create a new user
	 * 
	 * @param createUserDto The email and password of the user
	 * @param createUserDto.email The email of the user
	 * @param createUserDto.password The password of the user
	 *
	 * @returns {Promise<any>} The response contain the operation status and the created user
	 * 
	 * @response 200 {object} user - The created user
	 * @response 400 {string} message - "Bad Request"
	 * @response 500 {string} message - "Internal Server Error"
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
	 * 
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
	@Post('register')
	async create(@Body() createUserDto: CreateUserDto): Promise<any> {
		// Generate a request id to log the request
		const requestId = uuidv4();

		// Send de logs to logs microservice
		await this.loggerService.logInfo(requestId, 'api-getawey', createUserDto.email, 'auth.create', 'Create user request received', { email: createUserDto.email });

		// Add request in Payload
		const createRequestDto: CreateRequestDto = { createUserDto, requestId };

		// We convert the Observable to a Promise and catch the errors
		return await firstValueFrom(
			this.authService.send('auth.create', createRequestDto).pipe(
				catchError((error) => {
					throw new RpcException(error.message || 'Error creating user');
				})
			)
		);
	}

	/**
	 * 
	 * @route POST /auth/login
	 * @description Login a user
	 * 
	 * @param loginUserDto Password and email of the user
	 * @param loginUserDto.email The email of the user
	 * @param loginUserDto.password The password of the user
	 * 
	 * @returns {Promise<any>} The response contain the operation status and the token
	 * 
	 * @response 200 {object} token - The token
	 * @response 400 {string} message - "Bad Request"
	 * @response 500 {string} message - "Internal Server Error"
	 * 
	 * @example
	 * // Example success response
	 * statusCode: 200
	 * {
	 *     "status": "success",
	 * 	   "token": "eyjdslkjdfl...",
	 * }
	 * 
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
	 * // Email or password incorrect response
	 * statusCode: 400
	 * {
	 *     "message": "Email or password incorrect",
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
	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
		// Generate a request id to log the request
		const requestId = uuidv4();

		// Send de logs to logs microservice
		await this.loggerService.logInfo(requestId, 'api-getawey', loginUserDto.email, 'auth.login', 'Login request received', { email: loginUserDto.email });

		// Add request in Payload
		const loginRequestDto: LoginRequestDto = { loginUserDto, requestId };

		// We convert the Observable to a Promise and catch the errors
		return await firstValueFrom(
			this.authService.send({ cmd: 'auth.login' }, loginRequestDto).pipe(
				catchError((error) => {
					throw new RpcException(error.message || 'Error logging in user');
				})
			)
		);
	}

	/**
	 * 
	 * @description Verify the account
	 * @param token - Token to validate account
	 * @returns {Promise<any>} The response contain the operation status and the user
	 * @example
	 * // Example success response
	 * statusCode: 200  
	 * {    
	 *     "status": "success",
	 * 	 "message": "Account verified",   
	 * }
	 * 
	 * @example
	 * // User already active
	 * statusCode: 404
	 * {
	 *     "message": "User already active",
	 * 	 "status": "fail"
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
	@Get('verify-account/:token')
	async verifyAccount(@Param('token') token: string): Promise<any> {
		// Generate a request id to log the request
		const requestId = uuidv4();

		try {
			// Send de logs to logs microservice
			await this.loggerService.logInfo(requestId, 'api-getawey', token, 'auth.verify-account', 'Verify account request received', { token });

			// Check if token is valid
			if(!token || token === 'undefined') throw new RpcException({ message: 'Token is invalid', status: HttpStatus.BAD_REQUEST });
			
			// Add request in Payload
			const tokenRequestDto: TokenRequestDto = { token, requestId };

			// We convert the Observable to a Promise and catch the errors
			return await firstValueFrom(
				this.authService.send({ cmd: 'auth.verify-account' }, tokenRequestDto).pipe(
					catchError((error) => {
						throw new RpcException(error.message || 'Error verifying account');
					})
				)
			);
   
		} catch (error) {
			await logAndHandleError(error, this.loggerService, requestId, 'api-getawey', token, 'auth.verify-account');
		}
	}
}
