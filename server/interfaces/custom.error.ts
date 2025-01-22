import { ExceptionInfo } from '@app/interfaces/response.interface';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * @export
 * @class CustomError
 * @extends {HttpException}
 * @example new CustomError({ message: 'error message' }, HttpStatus.BAD_REQUEST)
 */
export class CustomError extends HttpException {
  constructor(
    options: ExceptionInfo,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(options, statusCode);
  }
}
