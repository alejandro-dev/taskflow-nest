import { Controller, Get, Post, Body, Inject, HttpException, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Services } from 'src/enums/services.enum';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
	/**
	* 
	* @param authService 
	* @description Inject the auth service to communicate with the auth service
	*/
	constructor(@Inject(Services.AUTH_SERVICE) private readonly authService: ClientProxy) {}

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
	 * // Internal Server Error response
	 * statusCode: 500
	 * {
	 *     "message": "Internal Server Error",
	 *     "status": 'error',
	 * }
	 */
	@Post('register')
	async create(@Body() createUserDto: CreateUserDto): Promise<any> {
		try {
			// We convert the Observable to a Promise and catch the errors
			return await firstValueFrom(
				this.authService.send('auth.create', createUserDto).pipe(
					catchError((error) => {
						throw new BadRequestException(error.message || 'Error creating user');
					})
				)
			);

		} catch (error) {
			throw error;
		}
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
		try {
			// We convert the Observable to a Promise and catch the errors
			return await firstValueFrom(
				this.authService.send('auth.login', loginUserDto).pipe(
					catchError((error) => {
						throw new InternalServerErrorException(error.message || 'Error logging in user');
					})
				)
			);
			
		} catch (error) {
			throw error;
		}
	}
}
