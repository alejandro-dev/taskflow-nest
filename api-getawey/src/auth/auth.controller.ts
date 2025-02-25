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
		* @returns 
		* @description Healthcheck endpoint to check if the service is up and running
		*/
	@Get('healt')
	healt() {
		return this.authService.send('auth.healt', {});
	} 

	/**
		* 
		* @param createUserDto 
		* @description Create a new user
		* @description Send the request to the auth service
		* @description The auth service will handle the request and return the response
		* @returns 
		* @throws
		* @example
		* {
		*     "email": "test@test.com",
		*     "password": "test123"
		* }
		* @example
		* 200
		* {
		*     "status": "success"
		* }
		* @example
		* 400
		* {
		*     "message": "Your request is invalid",
		* 	  "status": "fail",
		*     "details": [
		*         "password is not strong enough",
		*         "password must be a string"
		*     ],
		* }
		* @example
		* 500
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
	 * @param loginUserDto
	 * @description Login a user
	 * @description Send the request to the auth service
	 * @returns {Promise<any>}
	 * @throws
	 * @example
	 * 
	 * {
	 * 	"email": "alex@gmail.com",
	 * 	"password": "12345678"
	 * }
	 * 
	 * @example
	 * 200
	 * {
	 *     "status": "success",
	 * 	   "token": "eyjdslkjdfl...",
	 *     "user": {
	 *       "email": "alex@gmail.com",
	 *       "_id": "67b70370e5bb2f15a98aaf78",
	 *     }  
	 * }
	 * @example
	 * 400
	 * {
	 *     "message": "Your request is invalid",
	 * 	   "status": "fail",
	 *     "details": [
	 *         "password is not strong enough",
	 *         "password must be a string"
	 *     ],
	 * }
	 * @example
	 * 500
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
