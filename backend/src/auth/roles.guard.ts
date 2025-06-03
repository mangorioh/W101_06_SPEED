import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

interface RequestWithUser {
  user?: { role?: string };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // No roles required
    }
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (
      !user ||
      typeof user.role !== 'string' ||
      !requiredRoles.includes(user.role)
    ) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
