import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '../../shared/models/api.models';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const apiError = this.normalizeError(error);
        return throwError(() => apiError);
      })
    );
  }

  private normalizeError(error: HttpErrorResponse): ApiError {
    if (error.error && typeof error.error === 'object') {
      return {
        status: error.status,
        title: error.error.title,
        message: error.error.message ?? error.error.title,
        errors: error.error.errors,
        traceId: error.error.traceId,
      };
    }

    return {
      status: error.status,
      title: error.statusText || 'Request failed',
      message: typeof error.error === 'string' ? error.error : 'Something went wrong. Please try again.',
    };
  }
}
