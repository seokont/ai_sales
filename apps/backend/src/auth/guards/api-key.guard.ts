import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey =
      request.body?.apiKey ||
      request.query?.apiKey ||
      request.headers['x-api-key'] ||
      request.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) throw new UnauthorizedException('API key required');

    const company = await this.prisma.company.findUnique({
      where: { apiKey },
    });

    if (!company) throw new UnauthorizedException('Invalid API key');

    request.company = company;
    return true;
  }
}
