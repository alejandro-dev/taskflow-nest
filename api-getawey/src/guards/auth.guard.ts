import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { Services } from 'src/enums/services.enum';
  
/**
 * AuthGuard
 * 
 * @description Guard to check if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 * 
 */
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(@Inject(Services.AUTH_SERVICE) private readonly authService: ClientProxy) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Get the request from the context
		const request = context.switchToHttp().getRequest();

		// Extract the token from the request headers
		const token = this.extractTokenFromHeader(request);

		// If the token is not present, throw an error
		if (!token) throw new HttpException({ status: "fail", message: "Unauthorized" }, HttpStatus.UNAUTHORIZED);

		try {
			// Verify the token
			const response = await firstValueFrom(this.authService.send('auth.verify-token', { token }));
			if(response.error) throw new HttpException({ status: "fail", message: "Unauthorized" }, HttpStatus.UNAUTHORIZED);

			// Destructure the response
			const {token: renewToken, user} = response;
			request['token'] = renewToken;
			request['user'] = user;
			
			return renewToken;
		
		} catch(error) {
			console.log(error);
			// If the token is invalid, throw an error
			throw new HttpException({ status: "fail", message: "Unauthorized" }, HttpStatus.UNAUTHORIZED);
		}      
	}

	// Extract the token from the request headers
	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}