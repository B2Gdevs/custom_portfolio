/**
 * Custom error types for the compiler client
 */

export class CompilerError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number,
    public readonly stdout: string,
    public readonly stderr: string
  ) {
    super(message);
    this.name = 'CompilerError';
  }
}

export class BinaryNotFoundError extends Error {
  constructor(
    public readonly platform: string,
    public readonly arch: string
  ) {
    super(`Yarn Spinner compiler (ysc) binary not found for ${platform}/${arch}`);
    this.name = 'BinaryNotFoundError';
  }
}

