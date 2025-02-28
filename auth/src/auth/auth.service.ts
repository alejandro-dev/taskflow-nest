import { HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { handleRpcError } from 'src/filters/error-handler.filter';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
	// Inject the user repository to communicate with the user repository and the jwt service to sign the token and the redis client to publish the user.register event
	constructor(private readonly userRepository: UserRepository, private readonly jwtService: JwtService, @Inject('REDIS_CLIENT') private readonly redis: Redis) {}

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
	private signToken(payload: { id: string; email: string }): string {
		return this.jwtService.sign(payload, {
		  secret: process.env.JWT_SECRET,
		  expiresIn: '1h', 
		});
	}

	/**
	 * 
	 * @description Create a new user
	 * @param createUserDto - The user data to create a new user
	 * @param createUserDto.email - The email of the user
	 * @param createUserDto.password - The password of the user
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
	async create(createUserDto: CreateUserDto) {
		try {
			// Get the email and password from the dto
			const { password, email } = createUserDto;

			// Check if the user already exists
			const user = await this.userRepository.findByEmail(email);
			if(user) throw new RpcException({ message: 'User already exists', status: HttpStatus.BAD_REQUEST });

			// Create the user
			await this.userRepository.createUser(email, password);

			await this.redis.publish('user.register', JSON.stringify({ email }));
			this.redis.quit();
			
			return { status: 'success', message: 'Create user' };
		
		} catch (error) {
			handleRpcError(error);
		}
	}

	/**
	 * 
	 * @description Login a user
	 * @param loginUserDto - The user data to login a user
	 * @param loginUserDto.email - The email of the user
	 * @param loginUserDto.password - The password of the user
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
	async login(loginUserDto: LoginUserDto) {
		try {
			// Get the email and password from the dto
			const { password, email } = loginUserDto;

			// Check if the user already exists 
			const user = await this.userRepository.findByEmail(email);
			if(!user) throw new RpcException({ message: 'Email or password incorrect', status: HttpStatus.BAD_REQUEST });
			
			// Check if the password is correct
			if(!user.comparePassword(password)) throw new RpcException('Email or password incorrect');

			// Delete the password, active and updatedAt from the user object
			const { active, password: passUser, createdAt, updatedAt, ...userLogged } = user.toObject();

			return { user: userLogged, token: this.signToken({id: userLogged.id, email: userLogged.email}), status: 'success'};

		} catch (error) {
			handleRpcError(error);
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
				token: this.signToken({id: payload.id, email: payload.email}), 
				user: { id: payload.id, email: 	payload.email } 
			};

		} catch (error) {
			handleRpcError(error);
		}
    }
}
