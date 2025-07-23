export class ApiError {
  code: string;
  message: string;

  constructor(code: string, message: string) {
    this.code = code;
    this.message = message;
  }
}

export class Result<T> {
  data: T | null;
  errors: ApiError[] | null;
  warnings: string[] | null;
  info: string[] | null;
  isSuccess: boolean;

  constructor(data: T | null, errors: ApiError[] | null, isSuccess: boolean, warnings: string[] | null = null, info: string[] | null = null) {
    this.data = data;
    this.errors = errors;
    this.isSuccess = isSuccess;
    this.warnings = warnings;
    this.info = info;
  }

  public static success<T>(data: T): Result<T> {
    return new Result<T>(data, null, true);
  }

  public static failure<T>(errors: ApiError[]): Result<T> {
    return new Result<T>(null, errors, false);
  }
}
