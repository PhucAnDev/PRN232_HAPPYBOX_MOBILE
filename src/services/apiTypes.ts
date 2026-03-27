export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface LegacyApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}
