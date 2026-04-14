export class ValidationError extends Error {
  readonly statusCode = 400 as const;
  constructor(msg: string) {
    super(msg);
    this.name = 'ValidationError';
  }
}
