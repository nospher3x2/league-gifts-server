import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { SignInDto } from '../dtos/sign.in.dto';
import { validate } from 'class-validator';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const body = plainToInstance(SignInDto, request.body);

    const errors = await validate(body);
    const errorMessages = errors.flatMap((error) =>
      Object.values(error.constraints),
    );

    if (errors.length > 0) {
      const response = context.switchToHttp().getResponse<Response>();
      response.status(400).json({
        message: errorMessages,
        error: 'Bad Request',
        statusCode: 400,
      });
      return false;
    }

    return super.canActivate(context) as boolean;
  }
}
