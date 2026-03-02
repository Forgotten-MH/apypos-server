import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

vi.mock('../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../services/crypto/encryptionHelpers.js';
import { validate } from './validation.js';

const testSchema = z.object({
  name: z.string(),
  age: z.number().int(),
});

function mockReqRes(body: unknown) {
  const req = {
    body,
    ip: '127.0.0.1',
    method: 'POST',
    path: '/test',
    get: vi.fn(),
  } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('validate middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls next and sets parsed body on valid input', () => {
    const middleware = validate(testSchema);
    const { req, res, next } = mockReqRes({ name: 'Hunter', age: 25 });

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Hunter', age: 25 });
    expect(encryptAndSend).not.toHaveBeenCalled();
  });

  it('sends error response on invalid input', () => {
    const middleware = validate(testSchema);
    const { req, res, next } = mockReqRes({ name: 123 });

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(encryptAndSend).toHaveBeenCalledWith(
      {},
      res,
      req,
      400,
      2,
    );
  });

  it('sends error response on empty body', () => {
    const middleware = validate(testSchema);
    const { req, res, next } = mockReqRes({});

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(encryptAndSend).toHaveBeenCalledWith(
      {},
      res,
      req,
      400,
      2,
    );
  });
});
