import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { handleRpcError } from 'src/filters/error-handler.filter';

@Injectable()
export class AuthService {
	// Inject the user repository to communicate with the user repository and the jwt service to sign the token
	constructor(private readonly userRepository: UserRepository, private readonly jwtService: JwtService) {}

	/**
	 * 
	 * @description Sign the token
	 * @param payload 
	 * @returns 
	 * 
	 * @example
	 * {
	 * 	"id": "1234567890abcdef12345678",
	 * 	"email": "alex@gmail.com"
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
	 * @param createUserDto 
	 * @returns 
	 * 
	 * @example
	 * {
	 * 	"status": "success",
	 * 	"message": "Create user"
	 * }
	 * @example
	 * {
	 * 	"message": "User already exists",
	 * 	"statusCode": 400,
	 * 	"error": "Bad Request",
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

			return { status: 'success', message: 'Create user' };
		
		} catch (error) {
			handleRpcError(error);
		}
	}

	/**
	 * 
	 * @description Login a user
	 * @param loginUserDto 
	 * @returns 
	 * 
	 * @example
	 * {
	 * 	"status": "success",
	 * 	"token": "eyjdslkjdfl...",
	 * 	"user": {
	 * 		"id": "1234567890abcdef12345678",
	 * 		"email": "alex@gmail.com"
	 * 	}
	 * }
	 * @example
	 * {
	 * 	"message": "Email or password incorrect",
	 * 	"statusCode": 400,
	 * 	"error": "Bad Request",
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
			if(error instanceof RpcException) throw error;

			throw new RpcException({
				message: 'Internal Server Error',
				status: HttpStatus.INTERNAL_SERVER_ERROR,
			});
		}
	}

	/**
	 * 
	 * @description Verify the token
	 * @param token 
	 * @returns 
	 * 
	 * @example
	 * {
	 * 	"token": "eyjdslkjdfl...",
	 * 	"user": {
	 * 		"id": "1234567890abcdef12345678",
	 * 		"email": "alex@gmail.com"
	 * 	}
	 * }
	 * @example
	 * {
	 * 	"message": "Token expired",
	 * 	"statusCode": 401,
	 * 	"error": "Unauthorized",
	 * }
	 */
	verifyToken(token: string){
        const payload = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET
        });

        if(!payload) throw new UnauthorizedException();

        return { 
            token: this.signToken({id: payload.id, email: payload.email}), 
            user: { id: payload.id, email: payload.email } 
        };
    }
}
