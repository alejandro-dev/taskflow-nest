import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus, Inject, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { Services } from 'src/enums/services.enum';

/**
 * 
 * TaskAccessGuard
 * 
 * @description Guard to check if the user has access to the task
 * @returns {boolean} True if the user has access to the task, false otherwise
 */
@Injectable()
export class TaskAccessGuard implements CanActivate {
	constructor(@Inject(Services.TASKS_SERVICE) private readonly tasksService: ClientProxy) {}

    // Filtering of task access by role, author and assigned user
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user; 
		const taskId = request.params.id; 

      // If dont haver user return throw
		if (!user) throw new HttpException({ status: "fail", message: "Unauthorized" }, HttpStatus.FORBIDDEN);

		// Admin can access all tasks
		if (user.role === 'admin') return true;

		// Get the task from the task microservice
		const response = await firstValueFrom(
			this.tasksService.send({ cmd: 'tasks.findOne' }, { id: taskId }).pipe(
					catchError((error) => {
						throw new InternalServerErrorException(error.message || 'Error getting task');
					})
			)
		);

		// Access to task
		const task = response.task;

        // If the task does not exist, throw an exception
		if (!task) throw new HttpException({ status: "fail", message: "Task not found" }, HttpStatus.NOT_FOUND);

		// manager: You can access if you are an author or assignee
		if (user.role === 'manager' && (task.authorId === user.id || task.assignedUserId === user.id)) return true;

		// user: You can only access if you are the assigned user
		if (user.role === 'user' && task.assignedUserId === user.id) return true;

		throw new HttpException({ status: "fail", message: "You don't have permission to access this task" }, HttpStatus.FORBIDDEN);
	}
}
