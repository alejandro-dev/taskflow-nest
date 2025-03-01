import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/auth/auth.repository';
import { handleRpcError } from 'src/filters/error-handler.filter';

@Injectable()
export class UsersService {
   // Inject the user repository to communicate with the user repository
	constructor(private readonly userRepository: UserRepository) {}

   findAll() {
      try {
         return this.userRepository.findAll(['id', 'email']); 
         
      } catch (error) {
         handleRpcError(error);
      }
   }
}
