import { HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { handleRpcError } from 'src/filters/error-handler.filter';
import Redis from 'ioredis';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoggerService } from 'src/logs/logs.service';
import { logAndHandleError } from '../helpers/log-helper';
import { TokenRequestDto } from './dto/token-request.dto';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class AuthService {
	// Inject the user repository to communicate with the user repository and the jwt service to sign the token and the redis client to publish the user.register event
	constructor(private readonly userRepository: UserRepository, private readonly jwtService: JwtService, @Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly loggerService: LoggerService) {}

	/**
	 * 
	 * @description Sign the token
	 * @param payload - The payload to sign the token
	 * @param payload.id - The id of the user
	 * @param payload.email - The email of the user
	 * 
	 * @example
	 * // Example success response
	 * statusCode: 200 
	 * {
	 * 	"id": "1234567890abcdef12345678",
	 * 	"email": "alex@gmail.com"
	 * }
	 * 
	 * @example
	 * // Internal Server Error response
	 * statusCode: 500
	 * {
	 * 	"message": "Internal Server Error",
	 * 	"status": 'error',
	 * }
	 */
	private signToken(payload: { id: string; email: string, role: string }): string {
		return this.jwtService.sign(payload, {
		  secret: process.env.JWT_SECRET,
		  expiresIn: '1h', 
		});
	}

	/**
	 * 
	 * @description Create a new user
	 * @param createRequestDto - The user data to create a new user with the request id
	 * @param createRequestDto.requestId - The request id
	 * @param createRequestDto.createUserDto - The user data to create a new user
	 * @param createRequestDto.createUserDto.email - The email of the user	
	 * @param createRequestDto.createUserDto.password - The password of the user
	 * 
	 * @example
	 * // Example success response
	 * statusCode: 200
	 * {
	 * 	"status": "success",
	 * 	"message": "Create user"
	 * }
	 * 
	 * @example
	 * // Example bad request response
	 * statusCode: 400
	 * {
	 * 	"message": "User already exists",
	 * 	"stastus": "fail",
	 * }
	 * 
	 * @example
	 * // Internal Server Error response
	 * statusCode: 500
	 * {
	 * 	"message": "Internal Server Error",
	 * 	"status": 'error',
	 * }
	 */
	async create(createRequestDto: CreateRequestDto): Promise<Object | any> {
		try {
			// Get the email and password from the dto
			const { createUserDto, requestId } = createRequestDto;
			const { password, email } = createUserDto;

			// Check if the user already exists
			const user = await this.userRepository.findByEmail(email);
			if(user) throw new RpcException({ message: 'User already exists', status: HttpStatus.BAD_REQUEST });

			// We generate a random token for the user registration
			const token = crypto.randomBytes(20).toString('hex');

			// Create the user
			const userCreated = await this.userRepository.createUser(email, password, token);

			// Send event to send confimation email
			await this.redis.publish('user.register', JSON.stringify({ email, token }));
			
			// Send de logs to logs microservice and log the event
			await this.loggerService.logInfo(requestId, 'auth', userCreated.id, 'auth.create', 'Create user successfully', { userId: userCreated._id, email: userCreated.email, role: userCreated.role });
			
			return { status: 'success', message: 'Create user successfully' };
		
		} catch (error) {
			// Return the error to the caller and save the error in the logs
			await logAndHandleError(error, this.loggerService, createRequestDto?.requestId, 'auth', createRequestDto?.createUserDto?.email, 'auth.create');
		}
	}

	/**
     * 
     * @description Verify the account
	  * @param tokenRequestDto - The token to verify with the request id
	  * @param tokenRequestDto.requestId - The request id
	  * @param tokenRequestDto.token - The token to verify
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
	async verifyAccount(tokenRequestDto: TokenRequestDto): Promise<Object | any> {
		try {
			// Get the token and requestId from the dto
			const { token, requestId } = tokenRequestDto;

			// Find de user by token and check if the user is active
			const user = await this.userRepository.findByTokenNotActive(token);
			if(!user) throw new RpcException({ message: 'User already active', status: HttpStatus.NOT_FOUND });

			// Update the user active to true
			await this.userRepository.activeUser(user._id as string);

			// Send de logs to logs microservice and log the event
			await this.loggerService.logInfo(requestId, 'auth', user.id, 'auth.verify-account', 'Account verified', { userId: user.id, token: token });

			// Delete cache listUsers from Redis
			await this.redis.del(`AllUsers`);
			
			return { status: 'success', message: 'Account verified' };

		} catch (error) {
			// Return the error to the caller and save the error in the logs
			await logAndHandleError(error, this.loggerService, tokenRequestDto?.requestId, 'auth', tokenRequestDto?.token, 'auth.verify-account');
		}
	}

	/**
	 * 
	 * @description Login a user
	 * @param loginRequestDto - The user data to login a user with the request id
	 * @param loginRequestDto.requestId - The request id
	 * @param loginRequestDto.loginUserDto - The user data to login a user
	 * @param loginRequestDto.loginUserDto.email - The email of the user
	 * @param loginRequestDto.loginUserDto.password - The password of the user
	 * 
	 * @example
	 * // Example success response
	 * statusCode: 200
	 * {
	 * 	"status": "success",
	 * 	"token": "eyjdslkjdfl...",
	 * 	"user": {
	 * 		"id": "1234567890abcdef12345678",
	 * 		"email": "alex@gmail.com"
	 * 	}
	 * }
	 * @example
	 * // Example bad request response
	 * statusCode: 400
	 * {
	 * 	"message": "Email or password incorrect",
	 * 	"statusCode": 400,
	 * 	"error": "Bad Request",
	 * }
	 * 
	 * @example
	 * // Internal Server Error response
	 * statusCode: 500
	 * {
	 * 	"message": "Internal Server Error",
	 * 	"status": 'error',
	 * }
	 */
	async login(loginRequestDto: LoginRequestDto) {
		try {
			// Get the email and password from the dto
			const { loginUserDto, requestId } = loginRequestDto;
			const { password, email } = loginUserDto;

			// Check if the user already exists 
			const user = await this.userRepository.findByEmail(email);
			if(!user) throw new RpcException({ message: 'Email or password incorrect', status: HttpStatus.BAD_REQUEST });

			// Check is active is true
			if(!user.active) throw new RpcException({ message: 'The account is not active', status: HttpStatus.UNAUTHORIZED });
			
			// Check if the password is correct
			if(!await user.comparePassword(password)) throw new RpcException({ message: 'Email or password incorrect', status: HttpStatus.BAD_REQUEST });

			// Delete the password, active and updatedAt from the user object
			const { active, password: passUser, createdAt, updatedAt, ...userLogged } = user.toObject();

			// Send de logs to logs microservice and log the event
			await this.loggerService.logInfo(requestId, 'auth', userLogged._id, 'auth.login', 'Login successfully', { userId: userLogged._id, email: userLogged.email, role: userLogged.role });

			return { user: userLogged, token: this.signToken({id: userLogged._id, email: userLogged.email, role: userLogged.role}), status: 'success'};

		} catch (error) {
			// Return the error to the caller and save the error in the logs
			await logAndHandleError(error, this.loggerService, loginRequestDto?.requestId, 'auth', loginRequestDto?.loginUserDto?.email, 'auth.login');
		}
	}

	/**
	 * 
	 * @description Verify the token
	 * @param token - The token to verify
	 * 
	 * @example
	 * // Example success response
	 * statusCode: 200
	 * {
	 * 	"token": "eyjdslkjdfl...",
	 * 	"user": {
	 * 		"id": "1234567890abcdef12345678",
	 * 		"email": "alex@gmail.com"
	 * 	}
	 * }
	 * 
	 * @example
	 * // Token expired response
	 * statusCode: 401
	 * {
	 * 	"message": "Token expired",
	 * 	"statusCode": 401,
	 * 	"error": "Unauthorized",
	 * }
	 * 
	 * @example
	 * // Internal Server Error response
	 * statusCode: 500
	 * {
	 * 	"message": "Internal Server Error",
	 * 	"status": 'error',
	 * }
	 */
	verifyToken(token: string): any {
		try {
			// Verify the token
			const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
	
			// If the token is invalid, throw an error
			if(!payload) throw new UnauthorizedException();
	
			return { 
				status: 'success', 
				token: this.signToken({id: payload.id, email: payload.email, role: payload.role}), 
				user: { id: payload.id, email: payload.email, role: payload.role } 
			};

		} catch (error) {
			handleRpcError(error);
		}
   }
}
