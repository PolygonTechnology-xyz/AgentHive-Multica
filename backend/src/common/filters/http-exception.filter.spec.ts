import { BadRequestException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';
import { AuthErrorCode, authErrorResponse } from '../../modules/auth/auth-error-code';

const makeHost = (url = '/api/v1/foo') => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return {
    host: {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url }),
      }),
    },
    status,
    json,
  } as any;
};

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('handles HttpException with string detail', () => {
    const ctx = makeHost();
    filter.catch(new BadRequestException('bad input'), ctx.host);
    expect(ctx.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(ctx.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: HttpStatus.BAD_REQUEST, detail: 'bad input' }),
    );
  });

  it('handles HttpException with array detail', () => {
    const ctx = makeHost();
    const exc = new HttpException({ message: ['e1', 'e2'] }, 400);
    filter.catch(exc, ctx.host);
    expect(ctx.json).toHaveBeenCalledWith(expect.objectContaining({ detail: 'e1; e2' }));
  });

  it('preserves structured exception codes', () => {
    const ctx = makeHost();
    filter.catch(
      new ConflictException(
        authErrorResponse(AuthErrorCode.EMAIL_ALREADY_EXISTS, 'Email already registered'),
      ),
      ctx.host,
    );
    expect(ctx.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthErrorCode.EMAIL_ALREADY_EXISTS }),
    );
  });

  it('handles non-HttpException as 500', () => {
    const ctx = makeHost();
    filter.catch(new Error('boom'), ctx.host);
    expect(ctx.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('handles non-Error throwable', () => {
    const ctx = makeHost();
    filter.catch('string-error', ctx.host);
    expect(ctx.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('uses error response default message when none', () => {
    const ctx = makeHost();
    const exc = new HttpException(null as any, 418);
    filter.catch(exc, ctx.host);
    expect(ctx.json).toHaveBeenCalledWith(expect.objectContaining({ detail: 'Unexpected error' }));
  });
});
