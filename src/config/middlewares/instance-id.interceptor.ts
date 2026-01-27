import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as os from 'os';
import { Response } from 'express';

interface WrappedResponse<T> {
  instanceId: string;
  data?: T;
  message?: unknown;
  statusCode?: number;
}

@Injectable()
export class AllResponsesInterceptor<T> implements NestInterceptor<
  T,
  WrappedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<WrappedResponse<T>> {
    const instanceId = os.hostname();
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((data: T): WrappedResponse<T> => {
        if (data !== null && typeof data === 'object') {
          return {
            ...(data as Record<string, unknown>),
            instanceId,
          } as WrappedResponse<T>;
        }
        return { data, instanceId };
      }),
      catchError((err: unknown) => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorMessage: unknown = 'Internal Server Error';

        if (err instanceof HttpException) {
          status = err.getStatus();
          errorMessage = err.getResponse();
        } else if (err instanceof Error) {
          errorMessage = { message: err.message };
        }

        const errorBody = {
          ...(typeof errorMessage === 'object' && errorMessage !== null
            ? (errorMessage as Record<string, unknown>)
            : { message: errorMessage }),
          instanceId,
        };

        response.status(status).json(errorBody);

        return of() as unknown as Observable<never>;
      }),
    );
  }
}
