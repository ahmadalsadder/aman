export interface ApiError {
  code: string;
  message: string;
}

export interface Result<T> {
  data: T | null;
  errors: ApiError[] | null;
  warnings: string[] | null;
  info: string[] | null;
  isSuccess: boolean;
}
