import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import type { Response } from 'express';

const GRPC_STATUS_TO_HTTP: Record<number, number> = {
  [status.INVALID_ARGUMENT]: 400,
  [status.FAILED_PRECONDITION]: 400,
  [status.OUT_OF_RANGE]: 400,
  [status.UNAUTHENTICATED]: 401,
  [status.PERMISSION_DENIED]: 403,
  [status.NOT_FOUND]: 404,
  [status.ALREADY_EXISTS]: 409,
  [status.RESOURCE_EXHAUSTED]: 429,
  [status.UNIMPLEMENTED]: 501,
  [status.UNAVAILABLE]: 503,
  [status.DEADLINE_EXCEEDED]: 504,
};

type GrpcFailure = {
  code?: number;
  details?: string;
};

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      response
        .status(exception.getStatus())
        .json(typeof body === 'string' ? { message: body } : body);

      return;
    }

    const failure = exception as GrpcFailure;
    const code =
      typeof failure.code === 'number' && failure.code >= 1 && failure.code <= 16
        ? failure.code
        : status.UNKNOWN;
    const message =
      typeof failure.details === 'string' && failure.details.length > 0
        ? failure.details
        : 'Внутрішня помилка сервера';

    response
      .status(GRPC_STATUS_TO_HTTP[code] ?? 500)
      .json({ error: message });
  }
}
