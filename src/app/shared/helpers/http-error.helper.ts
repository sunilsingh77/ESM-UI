import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../components/models/api.models';

export class HttpErrorHelper {
  static getErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as Partial<ApiError>;
    if (apiError?.message) {
      return apiError.message;
    }

    switch (error.status) {
      case 0:
        return 'Unable to connect to the server.';
      case 400:
        return 'Invalid request.';
      case 401:
        return 'Unauthorized.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Internal server error.';
      default:
        return 'Unexpected error occurred.';
    }
  }
}
