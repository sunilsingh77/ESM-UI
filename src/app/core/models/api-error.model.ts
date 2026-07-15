export interface ApiError {
  success: boolean;
  statusCode: number;
  message: string;
  errorCode?: string;
  traceId?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
}
